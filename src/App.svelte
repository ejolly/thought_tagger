<script>
  // This is the main Svelte component that will display after a user provides conset within PsiTurk. It serves two main purposes: 1) it initializes a new entry into the firebase database if a workerId from the URL is not found or retrieves an existing record if a workerId is found. Creating a new entry sets up the random trial order the participant will receive for all the recordings. 2) it uses that information to dynamically render different experiment states based upon what a user does i.e. show instructions, show quiz, show experiment, show exit survey. Each of those different states exist as their own .svelte files within the pages/ folder
  import { onMount } from 'svelte';
  import { db, auth, fisherYatesShuffle, serverTime, params, dev } from './utils.js';
  import Instructions from './pages/Instructions.svelte';
  import Quiz from './pages/Quiz.svelte';
  import Consent from './pages/Consent.svelte';
  import Experiment from './pages/Experiment.svelte';
  import Debrief from './pages/Debrief.svelte';
  import Loading from './components/Loading.svelte';
  import Footer from './components/Footer.svelte';
  import MturkPreview from './pages/MTurkPreview.svelte';

  let currentState; // location of participant in app synced with firebase

  let trialOrder = []; // container for trials populated by firebase

  let initExperiment = false;

  // This function updates the current state of the user to dynamically render different parts of the experiment (i.e. instructions, quiz, etc)
  const updateState = async (newState) => {
    // Change to the new state within Svelte
    currentState = newState;
    try {
      const doc = {
        currentState
      };
      doc[`${currentState}_start`] = serverTime;
      await db.ref(`participants/${params.workerId}`).update(doc);
      console.log('updated user state');
    } catch (error) {
      console.error(error);
    }
  };
  const resetTestWorker = async (newState) => {
    // Change to the new state within Svelte
    if (params.workerId === 'test-worker') {
      currentState = 'consent';
      trialOrder = [];
      try {
        const query = await db
          .ref('recordings')
          .orderByChild('responses')
          .limitToFirst(10)
          .once('value');
        query.forEach((doc) => {
          trialOrder.push(doc.val().name);
        });
        fisherYatesShuffle(trialOrder);
        await db.ref(`participants/${params.workerId}`).set({
          workerId: params.workerId,
          assignmentId: params.assignmentId,
          hitId: params.hitId,
          startTime: serverTime,
          currentState: 'consent',
          currentTrial: 1,
          trialOrder
        });
        console.log('reset test-worker');
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log(`Reset user requested but workerId is ${params.workerId}`);
    }
  };

  if (params.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
    currentState = 'mturk-preview';
  } else if (
    params.workerId &&
    params.assignmentId !== 'ASSIGNMENT_ID_NOT_AVAILABLE' &&
    params.hitId
  ) {
    initExperiment = true;
  } else {
    currentState = 'non-mturk';
  }

  // Before we render anything see if we have a db entry for this subject based upon the URL parameters. If not create an entry with a new random stimulus order and put them into the instructions state. If we do, load their trial order and current experiment state
  // TODO: move logic for MTurk ad here, by checking value of params.assignmentId
  // TODO: Get all audio file names from database sorted by count and shuffle order of those with the same count to make sure multiple users dont do the same audio file when we first start running experiment
  onMount(async () => {
    if (initExperiment) {
      try {
        auth.onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await auth.signInWithEmailAndPassword(
                `${params.workerId}@experiment.com`,
                params.workerId
              );
              console.log('user found...signing in with credentials');
            } catch (error) {
              if (error.code === 'auth/user-not-found') {
                console.log('no user found...creating new credentials');
                await auth.createUserWithEmailAndPassword(
                  `${params.workerId}@experiment.com`,
                  params.workerId
                );
              } else {
                console.error(error);
              }
            }
          } else {
            console.log('user already authenticated...');
            try {
              const resp = await db.ref(`participants/${params.workerId}`).once('value');
              if (resp.val() !== null) {
                const data = resp.val();
                currentState = data.currentState;
                trialOrder = data.trialOrder;
                console.log('previous document found...loading state...');
              } else {
                const query = await db
                  .ref('recordings')
                  .orderByChild('responses')
                  .limitToFirst(10)
                  .once('value');
                query.forEach((doc) => {
                  trialOrder.push(doc.val().name);
                });
                fisherYatesShuffle(trialOrder);
                await db.ref(`participants/${params.workerId}`).set({
                  workerId: params.workerId,
                  assignmentId: params.assignmentId,
                  hitId: params.hitId,
                  startTime: serverTime,
                  currentState: 'consent',
                  currentTrial: 1,
                  trialOrder
                });
                currentState = 'consent';
                console.log('no previous document found...creating new...');
              }
            } catch (error) {
              console.error(error);
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
</script>

<section class="section">
  {#if !currentState}
    <Loading>Loading...</Loading>
  {:else if currentState === 'non-mturk'}
    <h1 class="title">Oops</h1>
    <p>
      It seems you are accessing this app without an mturk referral. If you meant to test it
      locally, make sure you launch it with
      <code>npm run dev</code>.
    </p>
  {:else if currentState === 'mturk-preview'}
    <MturkPreview />
  {:else if currentState === 'consent' || currentState === 'completed'}
    <Consent on:finished={() => updateState('instructions')} />
  {:else if currentState === 'instructions'}
    <Instructions on:finished={() => updateState('quiz')} />
  {:else if currentState === 'quiz'}
    <Quiz
      on:finishedComplete={() => updateState('debrief')}
      on:finishedContinue={() => updateState('experiment')} />
  {:else if currentState === 'experiment'}
    <Experiment {trialOrder} on:finished={() => updateState('debrief')} />
  {:else if currentState === 'debrief'}
    <Debrief />
  {/if}
</section>
<Footer on:resetTestWorker={resetTestWorker} />
