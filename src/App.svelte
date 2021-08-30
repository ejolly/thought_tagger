<!-- This is the main Svelte component that will display after a user provides conset within PsiTurk. It serves two main purposes: 1) it initializes a new entry into the firebase database if a workerId from the URL is not found or retrieves an existing record if a workerId is found. Creating a new entry sets up the random trial order the participant will receive for all the recordings. 2) it uses that information to dynamically render different experiment states based upon what a user does i.e. show instructions, show quiz, show experiment, show exit survey. Each of those different states exist as their own .svelte files within the pages/ folder -->
<script>
  // IMPORTS
  // -------------------------------------------
  import { onMount } from 'svelte';
  import {
    db,
    auth,
    fisherYatesShuffle,
    serverTime,
    params,
    initUser,
  } from './utils.js';
  import Instructions from './pages/Instructions.svelte';
  import Quiz from './pages/Quiz.svelte';
  import Consent from './pages/Consent.svelte';
  import Experiment from './pages/Experiment.svelte';
  import Debrief from './pages/Debrief.svelte';
  import Loading from './components/Loading.svelte';
  import Footer from './components/Footer.svelte';
  import MturkPreview from './pages/MTurkPreview.svelte';
  import ReturnHIT from './pages/ReturnHIT.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  let currentState; // location of participant in app synced with firebase
  let trialOrder = []; // container for trials populated by firebase
  let initExperiment = false; // whether to launch the app, stay in mturk preview mode or display a message if the live app is accessed outside of Mturk

  // Check how the app was navigated to:
  if (params.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
    // 1) No assignmentId so HIT is being previewed
    currentState = 'mturk-preview';
  } else if (
    params.workerId &&
    params.assignmentId !== 'ASSIGNMENT_ID_NOT_AVAILABLE' &&
    params.hitId
  ) {
    // 2) WorkedId, assignmentId, and hitID so the HIT was accepted
    initExperiment = true;
  } else {
    // 3) No URL params so the app was navigated to from outside of mturk
    currentState = 'non-mturk';
  }

  // COMPONENT LOGIC
  // -------------------------------------------
  // Update the user state and write to firebase
  const updateState = async (newState) => {
    const oldState = currentState;
    currentState = newState;
    try {
      const doc = {
        currentState,
      };
      doc[`${oldState}_end`] = serverTime;
      doc[`${currentState}_start`] = serverTime;
      await db.collection('participants').doc(params.workerId).update(doc);
      console.log('updated user state');
    } catch (error) {
      console.error(error);
    }
  };

  // Reset the firebase doc for test-worker and go back to the first app screen
  const resetTestWorker = async (newState) => {
    if (params.workerId === 'test-worker') {
      ({ trialOrder, currentState } = await initUser());
      console.log(`Reset test-worker. New state is ${currentState}`);
    } else {
      console.log('Reset user requested but app is not in dev mode');
    }
  };

  // If we're in situation 2 above (i.e. initExperiment) then handle firebase auth
  // Check to see if there's an existing user and doc under
  // U:workerId@experiment.com
  // P: workerId
  // If there is, load it up, i.e. resume from previous state
  // Otherwise create a new entry, shuffle recordings, and send them to consent
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
              const userDocRef = await db
                .collection('participants')
                .doc(params.workerId)
                .get();
              // Resume existing user session
              if (userDocRef.exists) {
                console.log('previous document found...loading state...');
                const data = userDocRef.data();
                currentState = data.currentState;
                trialOrder = data.trialOrder;
              } else {
                // Create new user session
                ({ trialOrder, currentState } = await initUser());
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

<!-- Core state management ("client-side router") that determines what a user sees -->
<section class="section">
  {#if !currentState}
    <Loading>Loading...</Loading>
  {:else if currentState === 'non-mturk'}
    <h1 class="title">Oops</h1>
    <p>
      It seems you are accessing this app without an mturk referral. If you
      meant to test it locally, make sure you launch it with
      <code>npm run dev</code>
      .
    </p>
  {:else if currentState === 'mturk-preview'}
    <MturkPreview />
  {:else if currentState === 'consent' || currentState === 'completed'}
    <Consent
      on:consent={() => updateState('instructions')}
      on:reject={() => updateState('noConsent')} />
  {:else if currentState === 'instructions'}
    <Instructions on:finished={() => updateState('quiz')} />
  {:else if currentState === 'quiz'}
    <Quiz
      on:finishedComplete={() => updateState('debrief')}
      on:finishedContinue={() => updateState('experiment')} />
  {:else if currentState === 'experiment'}
    <Experiment {trialOrder} on:finished={() => updateState('debrief')} />
  {:else if currentState === 'debrief'}
    <Debrief {currentState} />
  {:else if currentState === 'noConsent'}
    <ReturnHIT {currentState} />
  {/if}
</section>
<Footer on:resetTestWorker={resetTestWorker} />
