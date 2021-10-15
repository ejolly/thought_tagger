<!-- The Quiz component renders the Tutorial.svelte and ThoughtTagger.svelte components as children
with properties set to ensure that user understands how to complete the task while evaluting their comprehension -->
<script>
  import { storage, db, globalVars, userStore, updateUser } from '../utils.js';
  import { onMount } from 'svelte';

  // IMPORTS
  // -------------------------------------------
  import ThoughtTagger from '../components/ThoughtTagger.svelte';
  import Modal from '../components/Modal.svelte';
  import Loading from '../components/Loading.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  // Variables to be passed to ThoughtTagger and Modal
  const tutorial = [
    {
      title: 'Eligibility Quiz',
      content: `<p>You will now have to the opportunity try tagging some thoughts in a sample recording.</p><br/><p>We have already tagged <em>two example thoughts</em> to provide concrete examples of what we are looking for. Notice that even though the speaker made multiple pauses and disfluencies ('umm', 'ah') and even restarted their sentence half-way through, each example tag consists of a <strong>single complete idea</strong> about the character. When tagging thoughts on your own, take care to identify segments like these that may extend across natural pauses and interruptions in the speaker's speech. Other thoughts, may be easier to identify as they more closely follow natural speech breaks.</p><br/><p>You will have <strong>${globalVars.maxQuizAttempts} chances</strong> to try to identify <em>two more thoughts</em> within this audio file. We will verify your tags to determine your eligibility to continue with this HIT and earn a bonus payment for tagging more files. If you fail to correctly identify these thoughts you will be paid for the HIT but will ineligible for bonus work.</p><br><p>You can replay the tutorial video at anytime by clicking the <strong>help icon</strong> next to the audio controls.</p><br/><p><strong>Please disable any ad-blocker before starting to ensure the interface works properly!</strong></p><br/><p>`,
      state: 'overview',
    },
  ];
  const quiz = [
    {
      title: 'Correct!',
      content:
        '<div class="content"><p>Nice job! You did exactly what were looking for. After you finish tagging thoughts there are 3 additional questions we would like you to answer before submitting your tags. While these recordings are a maximum of 2 min in length not all speakers may have spoken for this length of time and not all recordings are of the same quality. So we would like you to additionally tell us: <ol class="1"><li>The approximate time that the speaker in the recording spoke for</li><li>The clarity of the audio recording</li><li>The difficulty of identifying thoughts based on the speaker style</li><ol>Please complete these now and click the Next button.</p></div>',
      state: 'pass',
    },
    {
      title: 'Try Again',
      content: `<p>Hmm your tags are not quite what we are looking for. We have highlighted the errors in red to distinguish which start and end times are incorrect. Please adjust your tags and click Done to try verifying your responses again.</p> <br><br>`,
      state: 'attempt',
    },
    {
      title: 'Ineligible',
      content:
        '<p>Unfortunately your tags still do not reflect what we are looking for. Therefore you can no longer continue with this HIT and earn bonus payments.<br><br>Do not worry, you will still be compensenated the base payment for this HIT.</p>',
      state: 'fail',
    },
    {
      title: 'Begin HIT',
      content: `<p>Perfect! You are now eligible to tag more recordings. You will earn a <strong>$${
        globalVars.bonusPerRecording
      }</strong> bonus for each additional recording you tag thoughts for. You will be able to tag up to <strong>${
        globalVars.numRecordings
      } recordings</strong> earning a potentional total bonus of <strong>$${
        globalVars.bonusPerRecording * globalVars.numRecordings
      }.</strong> You will also be able to stop working and submit this HIT at any time using the green <em>I'm finished</em> button that will appear at the bottom of the screen.<br/><br/><strong>Make sure to click the <em>Next</em> button once you are finished tagging and answering questions for a recording otherwise your work will not count towards your bonus payment!</strong><br/><br/> Alternatively you can submit this HIT now and earn your base payment (<strong>$${
        globalVars.basePayment
      }</strong>) without any bonuses. Please select your preference below </p>`,
      state: 'readyForExperiment',
    },
  ];
  const quizAnswers = [
    {
      startTime: 1.9,
      endTime: 7.4,
    },
    {
      startTime: 7.4,
      endTime: 21.0,
    },
    {
      startTime: 22.0,
      endTime: 35.0,
    },
    {
      startTime: 36.0,
      endTime: 49.0,
    },
    {
      startTime: 50.0,
      endTime: 62.0,
    },
    {
      startTime: 62.0,
      endTime: 70.0,
    },
    {
      startTime: 71.0,
      endTime: 88.0,
    },
    {
      startTime: 89.0,
      endTime: 108.0,
    },
    {
      startTime: 109.0,
      endTime: 120.0,
    },
  ];
  let modalOpen = true; // always start with open tutorial
  let showVideo = false;
  let numSegments = 0; // keep track of the number of tagged thoughts
  const isQuiz = true; // tell ThoughtTagger there is a tutorial it needs to communicate with
  // Reactive listener for printing current tutorial step
  $: console.log(`Current tutorial step: ${$userStore.tutorialStep}`);

  // COMPONENT LOGIC
  // -------------------------------------------
  // new function to ensure modal pops open if help is closed upon success
  const quizSuccess = async () => {
    $userStore.quizState = 'readyForExperiment';
    $userStore.tutorialComplete = true;
    await updateUser($userStore);
    modalOpen = true;
  };

  // ThoughtTagger Component triggered functions
  const quizAttempt = async () => {
    if (!$userStore.quizPassed) {
      if ($userStore.quizAttempts === globalVars.maxQuizAttempts) {
        $userStore.quizState = 'fail';
      } else {
        $userStore.quizState = 'attempt';
      }
    } else {
      $userStore.quizState = 'pass';
    }
    $userStore.tutorialComplete = true;
    await updateUser($userStore);
    modalOpen = true;
  };

  const updateSegmentsCount = async (ev) => {
    numSegments = ev.detail.numSegments;
    if (ev.detail.moveForward) {
      $userStore.tutorialStep = $userStore.tutorialStep + 1;
      await updateUser($userStore);
    }
  };

  // Initialization
  // Generate the file URL for the quiz audio and return as a promise
  // eslint-disable-next-line consistent-return
  const generateFileUrl = async () => {
    try {
      const file = storage.refFromURL(
        'gs://thought-segmentation.appspot.com/quiz.mp3'
      );
      const url = await file.getDownloadURL();
      return url;
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line prefer-const
  let quizAudio = generateFileUrl();
</script>

<style>
  .modal-card {
    border-radius: 6px;
    box-shadow: 3px 3px 3px rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.1);
    pointer-events: auto;
  }
  .modal {
    pointer-events: none;
  }
</style>

{#await quizAudio}
  <Loading>Loading...</Loading>
{:then src}
  <Modal
    {modalOpen}
    {tutorial}
    {quiz}
    {numSegments}
    on:toggleTutorial={() => (modalOpen = !modalOpen)}
    on:finishedTutorial
    on:finishedComplete
    on:finishedContinue />
  {#if showVideo}
    <div class="modal is-active">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Tutorial</p>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column has-text-centered">
              <video
                controls
                poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
                src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
                ><track kind="captions" /></video>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot has-text-centered">
          <p class="card-footer-item">
            <button
              class="button is-primary"
              on:click={() => (showVideo = false)}>
              Close
            </button>
          </p>
        </footer>
      </div>
    </div>
  {/if}
  <ThoughtTagger
    {src}
    {modalOpen}
    {isQuiz}
    {quizAnswers}
    on:updateSegmentsCount={updateSegmentsCount}
    on:quizAttempt={quizAttempt}
    on:help={() => (showVideo = !showVideo)}
    on:readyForExperiment={quizSuccess} />
{/await}
