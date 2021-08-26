<!-- This is the Consent component that will let a user proceed to the tutorial or return the HIT -->
<script>
  // IMPORTS
  // -------------------------------------------
  import { createEventDispatcher } from 'svelte';
  import { globalVars } from '../utils.js';

  // COMPONENT VARIABLES
  // -------------------------------------------
  const consent = `We need your consent to proceed. The following material explains this research study. We want you to understand what you are being asked to do and what risks and benefits, if any, are associated with the study. Consent with this form will indicate that you have been informed about the study and that you want to participate.<br/><br/>

    This project is being conducted by researchers from the department of Psychological and Brain Sciences at Dartmouth College, Hanover, NH, USA. The aim of the project is to understand how people recall information about other people. Your participation is voluntary. Participation involves listening to audio recordings in which a person is recalling their memories of a character from a television show they have seen, and indicating, to the best of your ability, separate and complete "thoughts" in their memory.<br/><br/>

    If you decide to take part in this study, you will be asked to listen to several 2-minute recordings and identify complete thoughts within each recording. The HIT will begin with an in-depth tutorial followed by a quiz to ensure your understanding. You will earn a <strong>base payment of $${globalVars.basePayment}</strong> for completing the tutorial, irrespective of whether you pass the quiz. Then you will be given the choice to identify thoughts in additional recordings to earn <strong>bonus payments of $${globalVars.bonusPerRecording}0 per additional recording</strong> you complete.<br/><br/>

    Your responses will will be collected in an anonymous fashion such that no identifying information will be stored alongside any responses you make during the task. Identifying information will not be used in any presentation or paper written about this project and such presentations will represent the aggregation of data from groups of people. <br><br> <strong>Do you understand and consent to these terms?</strong><br/>
    If so, click the "Accept consent" button below to be taken to the instructions. Otherwise, please return this HIT.`;

  const dispatch = createEventDispatcher();
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
            {@html consent}
          </div>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <button
              class="button is-danger controls"
              on:click={() => dispatch('reject')}>
              I do not consent
            </button>
          </p>
          <p class="card-footer-item">
            <button
              class="button is-success controls"
              on:click={() => dispatch('consent')}>
              I consent
            </button>
          </p>
        </footer>
      </div>
    </div>
  </div>
</div>
