<!-- The Quiz component renders the Tutorial.svelte and ThoughtTagger.svelte components as children
with properties set to ensure that user understands how to complete the task while evaluting their comprehension -->
<script>
  import { storage, db, globalVars, userStore, updateUser } from '../utils.js';
  import { onMount } from 'svelte';

  // IMPORTS
  // -------------------------------------------
  import ThoughtTagger from '../components/ThoughtTagger.svelte';
  import Tutorial from '../components/Tutorial.svelte';
  import Loading from '../components/Loading.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  // Variables to be passed to ThoughtTagger and Modal
  const tutorial = [
    {
      title: 'Overview',
      content:
        '<p>This brief tutorial will introduce you to the interface you will use to complete the task.</p><br/><p><em>Feel free to drag and reposition this popup as you progress through each step of the tutorial.</em></p>',
      state: 'overview',
    },
    {
      title: 'Recording Display',
      content:
        '<p>This part of the screen contains a visual representation of the audio recording. The top half of this display (in green) shows a zoomed in view of an <strong>audio snippet</strong> of the recording, while the bottom half displays the <strong>full recording</strong> along with a grey box highlighting the <strong>location of the snippet</strong> within the full recording. Below this are playback controls you can use to play, pause, and adjust the volume of the recording. Playback is synchronized between these controls and the visual display.</p><br><p>You can move to a specific location within the snippet (top) by <strong>clicking</strong> to move the position marker to a new location or by <strong>dragging</strong> the entire snippet display left or right. You can jump ahead or backwards in the full recording (bottom) by <strong>clicking</strong> anywhere in the audio waveform or by <strong>dragging</strong> the grey box.</p><br/><p>Feel free to click around within this display to get a feel for how you can control your position within the recording.</p>',
      state: 'recording',
    },
    {
      title: 'Controls',
      content:
        '<p>Next to the audio controls you will also find buttons to tag a new thought and submit your responses when you are finished tagging thoughts in this audio file. Below this you will see a section that lists your currently tagged thoughts. As you can see currently no thoughts have been tagged so nothing is visible.</p><br/><p>Try clicking the <strong>Tag</strong> button now.</p>',
      state: 'controls',
    },
    {
      title: 'Tagging Thoughts',
      content:
        'Notice how this added a <strong>row to the table</strong> along with markers to the visual display above. The <span class="has-text-weight-bold has-text-grey">start marker (light grey)</span> indicates the beginning of a tag based on your current position in the audio file. The <span class="has-text-weight-bold has-text-grey-darker">end marker (dark grey)</span> indicates the end of a tag and defaults to 5 seconds after the start marker. <br><br>You should edit these times to match when when you think a new thought begins and when that same thought ends. To edit these times first select this thought by <strong>clicking on its row within the table</strong>. This will automatically move the player to the start time of this thought. Then <strong>drag the markers</strong> in the top display using the square notch to make an adjustment. Notice how the values in the table change in sync with your actions in the display above. You can also delete a tag or play audio within a tag to verify your work using the buttons that appear. After you finish editing just click on the same row in the table to deselect it. Deselecting a row will automatically move the player to the end time of this thought.',
      state: 'overview',
    },
    {
      title: 'Example Thought',
      content:
        "We have now added a second tag to provide a concrete example of a <strong>correctly tagged thought.</strong> Try clicking on the second row and playing the thought to hear it. Notice that even though the speaker made multiple pauses and disfluencies ('umm', 'ah') and even restarted their sentence half-way through, this entire segment constitutes a single thought describing the character. When tagging thoughts on your own, take care to identify segments like this one that may extend across natural pauses and interruptions in the speaker's speech. Other thoughts, may be easier to identify as they more closely follow natural speech breaks.",
      state: 'overview',
    },
    {
      title: 'Comprehension Check',
      content:
        '<p>You now know how to use the controls and what constitutes a complete thought. Try to identify <strong>two more thoughts</strong> within this audio file to continue. We will verify your tags to determine your eligibility to continue with this HIT and earn a bonus payment for tagging more files. If you fail to correctly identify these thoughts you will be paid for the HIT but will not be permitted to continute tagging.</p><br><p>You can bring up and toggle through this guide by clicking the <strong>help icon</strong> next to the audio controls.</p>',
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
      content:
        '<p>Hmm your tags are not quite what we are looking for. Please adjust your tags and click Done to try verifying your responses again. <br><br> You will only have <strong>1 more chance</strong> to identify the correct tags before you forfeit any bonus payments. Use the help button next to the audio controls to close this guide.</p>',
      state: 'firstattempt',
    },
    {
      title: 'Ineligible',
      content:
        '<p>Unfortunately your tags still do not reflect what we are looking for. Therefore you can no longer continue with this HIT and earn bonus payments.<br><br>Do not worry, you will still be compensenated the base payment for this HIT.</p>',
      state: 'fail',
    },
    {
      title: 'Begin HIT',
      content: `<p>Perfect! You are now eligible to tag more recordings. You will earn a <strong>$${globalVars.bonusPerRecording}</strong> bonus for each additional recording you tag thoughts for. Otherwise you can complete this HIT and earn your payment (<strong>$${globalVars.basePayment}</strong>) without any bonuses. Please select your preference below </p>`,
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
  let numSegments = 0; // keep track of the number of tagged thoughts
  const hasTutorial = true; // tell ThoughtTagger there is a tutorial it needs to communicate with
  let tutorialComplete = false; // tell Tutorial where to hide progress buttons based on tutorial state; this changes when a quiz is first attempted
  let tutorialStep = 0; // stage of tutorial
  // Reactive listener for printing current tutorial step
  $: console.log(`Current tutorial step: ${tutorialStep}`);

  // COMPONENT LOGIC
  // -------------------------------------------
  // Tutorial Component triggered functions
  const updateTutorialState = (ev) => {
    tutorialStep = ev.detail.tutorialStep;
  };

  // new function to ensure modal pops open if help is closed upon success
  const quizSuccess = async () => {
    $userStore.quizState = 'readyForExperiment';
    await updateUser($userStore);
    modalOpen = true;
    tutorialComplete = true;
  };

  // ThoughtTagger Component triggered functions
  const quizAttempt = async () => {
    if (!$userStore.quizPassed) {
      if ($userStore.quizAttempts === globalVars.maxQuizAttempts) {
        $userStore.quizState = 'fail';
      } else {
        $userStore.quizState = 'firstattempt';
      }
    } else {
      $userStore.quizState = 'pass';
    }
    await updateUser($userStore);
    modalOpen = true;
    tutorialComplete = true;
  };

  const updateSegmentsCount = (ev) => {
    numSegments = ev.detail.numSegments;
    if (ev.detail.moveForward) {
      tutorialStep += 1;
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

{#await quizAudio}
  <Loading>Loading...</Loading>
{:then src}
  <Tutorial
    {modalOpen}
    {tutorial}
    {tutorialStep}
    {tutorialComplete}
    {quiz}
    {numSegments}
    on:stateChange={updateTutorialState}
    on:toggleTutorial={() => (modalOpen = !modalOpen)}
    on:finishedComplete
    on:finishedContinue />
  <ThoughtTagger
    {src}
    {hasTutorial}
    {tutorialStep}
    {quizAnswers}
    on:updateSegmentsCount={updateSegmentsCount}
    on:quizAttempt={quizAttempt}
    on:toggleTutorial={() => (modalOpen = !modalOpen)}
    on:readyForExperiment={quizSuccess} />
{/await}
