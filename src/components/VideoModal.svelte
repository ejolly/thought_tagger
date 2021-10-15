<!-- This is component that shows a modal with the tutorial video. It exepcts the video URL to be
passed in so it doesn't make any requests itself. It emits a close event that can be handled in
parent componets to control when it gets displayed, e.g. in Experiment.svelte and Quiz.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let videosrc;

  function dispatchClose() {
    dispatch('close');
  }
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

<div class="modal is-active">
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Tutorial</p>
    </header>
    <section class="modal-card-body">
      <div class="columns">
        <div class="column has-text-centered">
          <video controls src={videosrc}><track kind="captions" /></video>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot has-text-centered">
      <p class="card-footer-item">
        <button class="button is-primary" on:click={dispatchClose}>
          Close
        </button>
      </p>
    </footer>
  </div>
</div>
