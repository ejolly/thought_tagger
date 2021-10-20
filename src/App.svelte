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
  import LoginModal from './components/LoginModal.svelte';
  import Experiment from './pages/Experiment.svelte';
  import Loading from './components/Loading.svelte';
  import Footer from './components/Footer.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  let currentState; // Initially set by URL params and then overwritten by firestore if app is accessed via mturk in non-preview mode
  let initExperiment = false; // whether to launch the app, stay in mturk preview mode or display a message if the live app is accessed outside of Mturk
  let showLogin = true;
  let wrongPwd = false;

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

  const redoPrevious = async () => {
    $userStore.currentTrial -= 1;
    await updateUser($userStore);
    location.reload();
  };

  const login = async (ev) => {
    let password = ev.detail.password;
    try {
      await auth.signInWithEmailAndPassword(`Jonathan@cosanlab.com`, password);
      console.log('Login successful');
      showLogin = false;
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        wrongPwd = true;
      }
      console.error(error);
    }
  };
  // SETUP USER DATA SUBSCRIPTION
  onMount(async () => {
    try {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          showLogin = true;
        } else {
          console.log('user already authenticated...');
          console.log(user);
          showLogin = false;
          try {
            const userDocRef = db.collection('participants').doc('Jonathan');
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
  });
</script>

<!-- Core state management ("client-side router") that determines what a user sees -->
{#if showLogin}
  <LoginModal {wrongPwd} on:login={login} />
{:else}
  <section class="section">
    {#if !$userStore.currentState}
      <Loading>Loading...</Loading>
    {:else if $userStore.currentState === 'complete'}
      <h1 class="title">Thanks you're all done!</h1>
    {:else if $userStore.currentState === 'experiment'}
      <Experiment on:finished={() => updateState('complete')} />
    {/if}
  </section>
  <Footer on:resetTestWorker={resetTestWorker} on:redo={redoPrevious} />
{/if}
