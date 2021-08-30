<!-- This is a Tutorial component that appears like floating modal. It's rendered within Quiz.svelte
and workers in conjunction with ThoughtTagger.svelte  -->
<script>
  // IMPORTS
  // -------------------------------------------
  import { createEventDispatcher } from 'svelte';
  import { db, serverTime, userStore } from '../utils.js';

  // INPUTS FROM PARENT COMPONENT
  // -------------------------------------------
  export let modalOpen;
  export let tutorial;
  export let tutorialStep = 0;
  export let tutorialComplete;
  export let quiz;
  export let numSegments;

  // COMPONENT VARIABLES
  // -------------------------------------------
  let modalTitle;
  let modalContent;
  let q;

  // Reactively determine what to show in the modal depending on whether the tutorial is still going or what state of the quiz we're in
  $: if (!tutorialComplete) {
    modalTitle = tutorial[tutorialStep].title;
    modalContent = tutorial[tutorialStep].content;
  } else {
    [q] = quiz.filter((obj) => obj.state === $userStore.quizState);
    modalTitle = q.title;
    modalContent = q.content;
  }

  let modalXInitial;
  let modalYInitial;
  let modalXCurrent;
  let modalYCurrent;
  let modalXOffset = 0;
  let modalYOffset = 0;
  let dragActive = false;
  $: down = tutorialStep === 1;
  $: up = tutorialStep === 2 || $userStore.quizState === 'pass';
  $: right = tutorialStep === 3 || tutorialStep === 1;
  $: upp = tutorialStep === 3;

  const dispatch = createEventDispatcher();

  // COMPONENT LOGIC
  // -------------------------------------------
  // Move backwards through the tutorial pages
  const backward = () => {
    tutorialStep -= 1;
    tutorialStep = Math.max(tutorialStep, 0);
    dispatch('stateChange', { tutorialStep });
  };

  // Move forwards through the tutorial pages
  const forward = () => {
    tutorialStep = Math.min(tutorialStep + 1, tutorial.length - 1);
    dispatch('stateChange', { tutorialStep });
  };

  // Utility function for better screen position of the tutorial modal
  const setTranslate = (xPos, yPos, el) => {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  };

  // Utility function for dragging the tutorial modal
  const dragStart = (ev) => {
    if (ev.target.parentElement.closest('.modal')) {
      modalXInitial = ev.clientX - modalXOffset;
      modalYInitial = ev.clientY - modalYOffset;
      dragActive = true;
    }
  };

  // Utility function for dragging the tutorial modal
  const drag = (ev) => {
    if (dragActive) {
      modalXCurrent = ev.clientX - modalXInitial;
      modalYCurrent = ev.clientY - modalYInitial;
      modalXOffset = modalXCurrent;
      modalYOffset = modalYCurrent;
      const el = document.getElementById('modal');
      setTranslate(modalXCurrent, modalYCurrent, el);
    }
  };

  // Utility function for dragging the tutorial modal
  const dragEnd = (ev) => {
    modalXInitial = modalXCurrent;
    modalYInitial = modalYCurrent;
    dragActive = false;
  };
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
  .down {
    top: 15%;
  }
  .up {
    top: -15%;
  }
  .upp {
    top: -21%;
  }
  .right {
    left: 12%;
  }
  .controls {
    min-width: 50%;
  }
</style>

<div
  class={modalOpen ? 'modal is-active' : 'modal'}
  on:mousedown|preventDefault={dragStart}
  on:mouseup|preventDefault={dragEnd}
  on:mousemove|preventDefault={drag}>
  <div class="modal-card" id="modal" class:up class:right class:down class:upp>
    <header class="modal-card-head">
      <p class="modal-card-title">{modalTitle}</p>
    </header>
    <section class="modal-card-body">
      {@html modalContent}
    </section>
    <footer class="modal-card-foot">
      {#if !tutorialComplete}
        <p class="card-footer-item">
          <button class="button is-link controls" on:click={backward}>
            <span class="icon"> <i class="fas fa-backward" /> </span>
          </button>
        </p>
        <p class="card-footer-item">
          {#if tutorialStep === tutorial.length - 1}
            <button
              class="button is-link"
              on:click={() => {
                dispatch('toggleTutorial');
              }}>
              Hide Help
            </button>
          {:else if tutorialStep !== 2 || numSegments > 0}
            <button class="button is-link controls" on:click={forward}>
              <span class="icon"> <i class="fas fa-forward" /> </span>
            </button>
          {/if}
        </p>
      {:else if $userStore.quizState === 'readyForExperiment'}
        <p class="card-footer-item">
          <button
            class="button is-warning is-large"
            on:click={() => dispatch('finishedComplete')}>
            Skip bonus work
          </button>
        </p>
        <p class="card-footer-item">
          <button
            class="button is-success is-large"
            on:click={() => dispatch('finishedContinue')}>
            Do bonus work
          </button>
        </p>
      {:else if $userStore.quizState === 'firstattempt'}
        <p class="card-footer-item">
          <button
            class="button is-link"
            on:click={() => dispatch('toggleTutorial')}>
            Try again
          </button>
        </p>
      {:else if $userStore.quizState === 'pass'}
        <p class="card-footer-item">
          <button
            class="button is-link"
            on:click={() => dispatch('toggleTutorial')}>
            Hide Help
          </button>
        </p>
      {:else if $userStore.quizState === 'fail'}
        <p class="card-footer-item">
          <button
            class="button is-success is-large"
            on:click={() => dispatch('finishedComplete')}>
            Finish
          </button>
        </p>
      {/if}
    </footer>
  </div>
</div>
