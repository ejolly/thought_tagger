<!-- This is the Instructions page. It loops over the instructions array and finally notifies the main App.svelte component by dispatching a 'finished' event on the last instruction element. When the last page of the instructions are reached the forward button turns into a "Take Quiz" button, but currently there is no quiz and it goes straight to the experiment. -->
<script>
  // IMPORTS
  // -------------------------------------------
  import { createEventDispatcher } from 'svelte';
  import { globalVars } from '../utils.js';

  // COMPONENT VARIABLES
  // -------------------------------------------
  // This array determines the number of instruction screens
  const instructions = [
    "In this task, you will listen to a series of audio recordings (~2 min each) in which you will hear people describing characters from a television drama. The goal of this task is to divide the audio into separate speech segments or <strong>thoughts.</strong><br><br>In written text, separate <em>sentences</em> are a straightforward way to separate complete thoughts. However, in verbal speech complete thoughts often span multiple sentences. Your goal is to try to <strong>identify the boundaries of these natural divisions within each audio recording.</strong><br/><br/>While listening, pay close attention to where there are natural breaks in the person's speech and thought process.",

    `The next page will show you video describing how to use our custom interface to complete this task. After watching the video you will take an interactive quiz in which you will tag thoughts in a sample recording. This will give you an opportunity to become familiar with the interface while also checking the quality of your tags You will have <strong>${globalVars.maxQuizAttempts} attempts</strong> to pass this quiz.<br><br> If you fail to pass this quiz you will only be paid the base amount for accepting this HIT (<strong>$${globalVars.basePayment}</strong>).<br><br> If you pass this quiz you will be eligible to earn bonus payments for each audio recording you tag at the rate of <strong>$${globalVars.bonusPerRecording} per recording.</strong>`,
  ];

  const finalButtonText = 'Go To Tutorial'; // button text on the last instruction page
  const dispatch = createEventDispatcher(); // to notify App.svelte
  let currentPage = 0; // page tracker

  // COMPONENT LOGIC
  // -------------------------------------------
  // Move back a page
  const backward = () => {
    currentPage -= 1;
    currentPage = Math.max(currentPage, 0);
  };
  // Move forward a page
  const forward = () => {
    // Check if we're increasing the value of currentPage beyond the number of instructions, if so tell App.svelte we're ready to move to the quiz
    if (currentPage + 1 === instructions.length) {
      dispatch('finished');
    } else {
      currentPage += 1;
      currentPage = Math.min(currentPage, instructions.length - 1);
    }
  };
</script>

<style>
  .no-space-hr {
    margin: 0;
  }
  .custom-card-title {
    margin-bottom: 2% !important;
    padding-top: 2% !important;
  }
  .controls {
    min-width: 50%;
  }
</style>

<div class="container">
  <div class="columns is-centered">
    <div class="column is-three-fifths ">
      <div class="card">
        <div class="has-text-centered">
          <h1 class="title is-2 custom-card-title">Instructions</h1>
          <hr class="no-space-hr" />
        </div>
        <div class="card-content">
          <div class="content">
            {@html instructions[currentPage]}
          </div>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <button
              class="button is-link controls"
              class:is-invisible={currentPage === 0}
              on:click={backward}>
              <span class="icon">
                <i class="fas fa-backward" />
              </span>
            </button>
          </p>
          <p class="card-footer-item">
            <button class="button is-link controls" on:click={forward}>
              {#if currentPage === instructions.length - 1}
                Watch Tutorial Video
              {:else}
                <span class="icon">
                  <i class="fas fa-forward" />
                </span>
              {/if}
            </button>
          </p>
        </footer>
      </div>
    </div>
  </div>
</div>
