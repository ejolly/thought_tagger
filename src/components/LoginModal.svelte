<script>
  import { createEventDispatcher } from 'svelte';

  export let wrongPwd;
  const dispatch = createEventDispatcher();

  let password = '';

  function dispatchLogin() {
    dispatch('login', { password });
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
  .rows {
    display: flex;
    flex-direction: column;
  }
  .row {
    margin-bottom: 0.5rem;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }
</style>

<div class="modal is-active">
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Please enter the password</p>
    </header>
    <section class="modal-card-body">
      <div class="rows has-text-centered">
        <div class="row">
          <input
            class="input is-primary"
            type="password"
            bind:value={password} />
        </div>
        <div class="row">
          <button class="button is-success" on:click={dispatchLogin}
            >Login</button>
        </div>
        <div class="row" class:is-invisible={!wrongPwd}>
          <p class="has-text-danger is-size-7">Wrong password</p>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot has-text-centered" />
  </div>
</div>
