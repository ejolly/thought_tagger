<script>
  import { globalVars } from '../utils.js';

  // Add/remove items here to create more instructions pages
  const consent = `
    This project is being conducted by researchers from the department of Psychological and Brain Sciences at Dartmouth College, Hanover, NH, USA. The aim of the project is to understand how people recall information about other people. Your participation is voluntary. Participation involves listening to audio recordings in which a person is recalling their memories of a character from a television show they have seen, and indicating, to the best of your ability, separate and complete "thoughts" in their memory.<br/><br/>

    If you decide to take part in this study, you will be asked to listen multiple 2 minute recordings and identify complete thoughts within each recording. You will earn a <strong>base payment of $${globalVars.basePayment}</strong> for completing the instructions and comprehension quiz, irrespective of whether you pass the quiz. Then you will be given the choice to identify thoughts in additional recordings to earn <strong>bonus payments of $${globalVars.bonusPerRecording} per additional recording</strong> you complete.<br/><br/>

    Your responses will will be collected in an anonymous fashion such that no identifying information will be stored alongside any response you make during the task. Identifying information will not be used in any presentation or paper written about this project and such presentations will represent the aggregation of data from groups of people. <br><br> <strong>Do you understand and consent to these terms?</strong><br/>
    If so, click the "Accept consent" button below to be taken to the instructions. Otherwise, please return this HIT.`;

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
          <h1 class="title is-2 custom-card-title">MTurk Preview</h1>
          <hr class="no-space-hr" />
        </div>
        <div class="card-content">
          <div class="content">
            {@html consent}
          </div>
        </div>
        <!-- <footer class="card-footer">
          <p class="card-footer-item">
            <button class="button is-danger controls" on:click={() => dispatch('reject')}>
              I do not consent
            </button>
          </p>
          <p class="card-footer-item">
            <button class="button is-success controls" on:click={() => dispatch('consent')}>
              I consent
            </button>
          </p>
        </footer> -->
      </div>
    </div>
  </div>
</div>






<!-- <h1 class="is-size-1">This is the ad</h1> -->
