<script>
  import { createEventDispatcher } from 'svelte';

  // Add/remove items here to create more instructions pages
  const consent = [
    'We need your consent to proceed. The following material explains this research study. We want you to understand what you are being asked to do and what risks and benefits, if any, are associated with the study. Consent with this form will indicate that you have been informed about the study and that you want to participate.',

    'This project is being conducted by researchers from the department of Psychological and Brain Sciences at Dartmouth College, Hanover, NH, USA. This study aims to understand INSERT AIM OF STUDY HERE.',

    'Your participation is voluntary. Participation involves INSERT BASIC SUMMARY OF PARTICIPATION INVOLVEMENT HERE',

    'If you decide to take part in this study, you will be asked to listen to a variety of media that vary in emotional content. If any of the media presented should make you feel too uncomfortable to continue with the study, you are free to immediately withdraw your participation without giving up payment (send us an email <a href="mailto:eshin.jolly@gmail.com">here</a> after withdrawing for payment information). To be clear: you may immediately end your participation if any aspect of the research procedure makes you too uncomfortable to continue. Lastly, if you have any discomfort or concerns after viewing the media, you are encouraged to contact the principal investigator <a href="mailto:eshin.jolly@gmail.com">here</a>.',

    'The information collected will be anonymous and no identifying information will be stored with the data collected during the experiment. Identifying information will not be used in any presentation or paper written about this project and such presentations will represent the aggregation of data from groups of people. <br><br> <strong>Do you understand and consent to these terms?</strong> If so, click the "Accept consent" button below to be taken to the instructions. Otherwise, please return this HIT.'
  ];

  const dispatch = createEventDispatcher();
  let currentPage = 0;

  const backward = () => {
    currentPage -= 1;
    currentPage = Math.max(currentPage, 0);
  };
  const forward = () => {
    // Check if we're increasing the value of currentPage beyond the number of instructions, if so tell App.svelte we're ready to move to the quiz
    if (currentPage + 1 === consent.length) {
      dispatch('finished');
    } else {
      currentPage += 1;
      currentPage = Math.min(currentPage, consent.length - 1);
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
          <h1 class="title is-2 custom-card-title">Consent</h1>
          <hr class="no-space-hr" />
        </div>
        <div class="card-content">
          <div class="content">
            {@html consent[currentPage]}
          </div>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <button class="button is-link controls" on:click={backward}>
              <span class="icon">
                <i class="fas fa-backward" />
              </span>
            </button>
          </p>
          <p class="card-footer-item">
            <button class="button is-link controls" on:click={forward}>
              {#if currentPage === consent.length - 1}
                Accept consent
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
