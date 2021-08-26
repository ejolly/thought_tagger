<script>
  import { globalVars } from '../utils.js';

  // TODO: fill in placeholder ad
  const ad = `In this HIT you will be asked to listen to multiple 2 minute recordings and identify complete thoughts within each recording. You will earn a <strong>base payment of $${globalVars.basePayment}</strong> for completing the instructions and comprehension quiz, irrespective of whether you pass the quiz. Then you will be given the choice to identify thoughts in additional recordings to earn <strong>bonus payments of $${globalVars.bonusPerRecording} per additional recording</strong> you complete. If you would like to participate, please accept this HIT!<br/><br/>`;

</script>

<style>
  .no-space-hr {
    margin: 0;
  }
  .custom-card-title {
    margin-bottom: 2% !important;
    padding-top: 2% !important;
  }
</style>

<div class="container">
  <div class="columns is-centered">
    <div class="column is-three-fifths ">
      <div class="card">
        <div class="has-text-centered">
          <h1 class="title is-2 custom-card-title">HIT Preview</h1>
          <hr class="no-space-hr" />
        </div>
        <div class="card-content">
          <div class="content">
            {@html ad}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

