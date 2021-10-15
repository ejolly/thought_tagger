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
    userStore,
    updateUser,
  } from './utils.js';
  import Instructions from './pages/Instructions.svelte';
  import Quiz from './pages/Quiz.svelte';
  import Consent from './pages/Consent.svelte';
  import Explainer from './pages/Explainer.svelte';
  import Experiment from './pages/Experiment.svelte';
  import Debrief from './pages/Debrief.svelte';
  import Loading from './components/Loading.svelte';
  import Footer from './components/Footer.svelte';
  import MturkPreview from './pages/MTurkPreview.svelte';
  import ReturnHIT from './pages/ReturnHIT.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  let currentState; // Initially set by URL params and then overwritten by firestore if app is accessed via mturk in non-preview mode
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
    currentState = 'mturk'; // this it just to disable the non-mturk and preview-mturk logic guards in the HTML below. The real experiment makes use of the $userStore.currentState
  } else {
    // 3) No URL params so the app was navigated to from outside of mturk
    currentState = 'non-mturk';
  }

  // COMPONENT LOGIC
  // -------------------------------------------
  // Update the user state and write to firebase
  const updateState = async (newState) => {
    const oldState = $userStore.currentState;
    $userStore.currentState = newState;
    try {
      $userStore[`${oldState}_end`] = serverTime;
      $userStore[`${$userStore.currentState}_start`] = serverTime;
      await updateUser($userStore);
    } catch (error) {
      console.error(error);
    }
  };

  // Reset the firebase doc for test-worker and go back to the first app screen
  const resetTestWorker = async (newState) => {
    if (params.workerId === 'test-worker') {
      await initUser();
      console.log(`Reset test-worker. New state is ${$userStore.currentState}`);
    } else {
      console.log('Reset user requested but app is not in dev mode');
    }
  };

  const submitHIT = async (ev) => {
    // Now we update the app state to the complete screen and upon doing so create an invisible form and submit that. Since this function is only triggered on the submit event from Debrief.svelte, it only occurs once. So if a user tries to return to the app again, they will see the completion screen but the logic for creating and submitting a form won't execute, thus blocking them from repeat participation.
    await updateState('complete');
    // create the form element and point it to the correct endpoint
    const form = document.createElement('form');
    form.action = params.turkSubmitTo + '/mturk/externalSubmit';
    form.method = 'post';

    // attach the assignmentId
    const inputAssignmentId = document.createElement('input');
    inputAssignmentId.name = 'assignmentId';
    inputAssignmentId.value = params.assignmentId;
    inputAssignmentId.hidden = true;
    form.appendChild(inputAssignmentId);

    // mturk requires the form to have at least 1 piece of data so make it the user bonus
    const userBonus = document.createElement('input');
    userBonus.name = 'userBonus';
    userBonus.value = JSON.stringify($userStore.bonus);
    userBonus.hidden = true;
    form.appendChild(userBonus);

    // attach the form to the HTML document and trigger submission
    document.body.appendChild(form);
    form.submit();
  };

  // SETUP USER DATA SUBSCRIPTION
  // If we're in situation 2 above (i.e. initExperiment) then handle firebase auth
  // Check to see if there's an existing user and doc under
  // U:workerId@experiment.com
  // P: workerId
  // If there is, subscribe to it for live changes
  // Otherwise create a new user document (initUser() from utils.js)
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
              const userDocRef = db
                .collection('participants')
                .doc(params.workerId);
              const userDoc = await userDocRef.get();
              // Resume existing user session
              if (userDoc.exists) {
                console.log('previous document found...loading state...');
                // hookup subscription to $userStore
                userDocRef.onSnapshot((doc) => {
                  userStore.set(doc.data());
                });
              } else {
                // Create new user session
                console.log('no previous document found...creating new...');
                await initUser();
                // hookup subscription to $userStore
                userDocRef.onSnapshot((doc) => {
                  userStore.set(doc.data());
                });
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
  {#if currentState === 'non-mturk'}
    <h1 class="title">Oops</h1>
    <p>
      It seems you are accessing this app without an mturk referral. If you
      meant to test it locally, make sure you launch it with
      <code>npm run dev</code>
      .
    </p>
  {:else if currentState === 'mturk-preview'}
    <MturkPreview />
  {:else if !$userStore.currentState}
    <Loading>Loading...</Loading>
  {:else if $userStore.currentState === 'complete'}
    <h1 class="title">Thank You for Participating!</h1>
    <p>
      This HIT is no longer available because you have already completed it.
    </p>
  {:else if $userStore.currentState === 'consent'}
    <Consent
      on:consent={() => updateState('instructions')}
      on:reject={() => updateState('noConsent')} />
  {:else if $userStore.currentState === 'instructions'}
    <Instructions on:finished={() => updateState('tutorial')} />
  {:else if $userStore.currentState === 'tutorial'}
    <Explainer on:finished={() => updateState('quiz')} />
  {:else if $userStore.currentState == 'quiz'}
    <Quiz
      on:finishedTutorial={() => updateState('quiz')}
      on:finishedComplete={() => updateState('debrief')}
      on:finishedContinue={() => updateState('experiment')} />
  {:else if $userStore.currentState === 'experiment'}
    <Experiment on:finished={() => updateState('debrief')} />
  {:else if $userStore.currentState === 'debrief'}
    <Debrief on:submit={submitHIT} />
  {:else if $userStore.currentState === 'noConsent'}
    <ReturnHIT />
  {/if}
</section>
<Footer
  on:resetTestWorker={resetTestWorker}
  on:finished={() => updateState('debrief')} />
