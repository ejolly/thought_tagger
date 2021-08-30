<!--  This is the debrief page in which collect any post survey questions. There's a single button that saves reponses to firebase and then tells Mturk we're done. -->
<script>
  // IMPORTS
  // -------------------------------------------
  import { db, params, serverTime, userStore, updateUser } from '../utils.js';

  // COMPONENT VARIABLES
  // -------------------------------------------
  let submitURL = params.turkSubmitTo + '/mturk/externalSubmit';
  let age = '';
  let feedback = '';
  let sex = '';
  let ethnicity = '';
  let race = [];
  const raceOptions = [
    'Asian / Asian-American',
    'Black / African-American',
    'Native-American / Alaskan-Native',
    'Pacific-Islander / Native-Hawaiian',
    'White / Caucasian',
    'Other / Unknown',
  ];
  let nativeLang = '';
  let birth = '';
  let handed = '';

  // COMPONENT LOGIC
  // -------------------------------------------
  // Update completion status in firebase and submit the HIT to mturk using the recommended external HIT strategy of posting a form from within the iframe to the external window
  const submitHIT = async () => {
    $userStore.age = age;
    $userStore.sex = sex;
    $userStore.ethnicity = ethnicity;
    $userStore.race = race;
    $userStore.nativeLang = nativeLang;
    $userStore.birth = birth;
    $userStore.handed = handed;
    $userStore.feedback = feedback;
    $userStore.HIT_complete = serverTime;
    $userStore.currentState = 'completed';
    await updateUser($userStore);
    console.log('exit survey added successfully');
    window.top.postMessage('finished', '*');
    console.log('back to MTurk!');
  };
</script>

<style>
  .age-input {
    width: 3rem;
  }
  .lang-input {
    width: 20rem;
  }
  .textarea-feedback {
    min-width: 80%;
    max-width: 80%;
  }
</style>

<div class="container">
  <div class="columns is-centered">
    <div class="column is-three-quarters">
      <p class="title is-3 has-text-centered">Thank You For Participating!</p>
      <p class="subtitle is-6 has-text-centered">
        <em>All questions are optional</em>
      </p>
      <form name="mturk" action={submitURL} method="POST">
        <input
          type="hidden"
          name="assignmentId"
          id="assignmentId"
          value={params.assignmentId} />
        <input type="hidden" name="dummy_input_DONT_REMOVE" value="1" />
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Age</label>
          </div>
          <div class="field-body is-narrow">
            <div class="field">
              <p class="control">
                <input class="input age-input" type="text" bind:value={age} />
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Gender</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input type="radio" bind:group={sex} value={'male'} />
                  Male
                </label>
                <label class="radio">
                  <input type="radio" bind:group={sex} value={'female'} />
                  Female
                </label>
                <label class="radio">
                  <input type="radio" bind:group={sex} value={'other'} />
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Handedness</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input type="radio" bind:group={handed} value={'left'} />
                  Left Handed
                </label>
                <label class="radio">
                  <input type="radio" bind:group={handed} value={'right'} />
                  Right Handed
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Ethnicity</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input
                    type="radio"
                    bind:group={ethnicity}
                    value={'hispanic'} />
                  Hispanic
                </label>
                <label class="radio">
                  <input
                    type="radio"
                    bind:group={ethnicity}
                    value={'not_hispanic'} />
                  Not Hispanic
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Race</label>
          </div>
          <div class="field-body is-narrow">
            <div class="field">
              <div class="control">
                <div class="select is-multiple">
                  <select multiple bind:value={race}>
                    {#each raceOptions as raceOption}
                      <option value={raceOption}>{raceOption}</option>
                    {/each}
                  </select>
                </div>
              </div>
              <p class="help">Cmd/Ctrl+Click to select multiple</p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Native Language</label>
          </div>
          <div class="field-body is-narrow">
            <div class="field">
              <p class="control">
                <input
                  class="input lang-input"
                  type="text"
                  bind:value={nativeLang} />
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Birth Location</label>
          </div>
          <div class="field-body is-narrow">
            <div class="field">
              <p class="control">
                <input
                  class="input lang-input"
                  type="text"
                  bind:value={birth}
                  placeholder="City, State, Country" />
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Feedback</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <textarea
                  class="textarea textarea-feedback"
                  bind:value={feedback}
                  placeholder="Thoughts or suggestions about this HIT" />
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <!-- Left empty for spacing -->
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <button class="button is-success is-large" on:click={submitHIT}
                  >Submit HIT</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
