# Thought Tagging

This is a front-end only, web-app for segmenting audio-recordings into separate *thoughts*. It's built using [Svelte](https://svelte.dev/), [Bulma](https://bulma.io/documentation/), [Peaks.js](https://github.com/bbc/peaks.js), and uses [Firebase](https://firebase.google.com/) to store data.

## Developing  

### Getting setup

1. First `git clone` this repository
2. `cd` into the `thought-tagging` folder
3. run `npm install` to setup the app dependencies on your local machine (you only need to do this once)
4. run `npm run dev` to start a local server and go to `localhost:5000` to see the app

### Deploying

This should be configured on pushes to Netlify and be live at https://thought-tagger.netlify.app.
But to test the built app locally, i.e. without the development banner at the bottom use `npm run test`. This will first build the app and then serve the built version (i.e. the version in the `public` folder) simulating the experience on Netlify. 

## How the app behaves when navigated to 

Only the `public` folder gets deployed to Netlify, which contains a "skeleton" HTML file that gets filled in using the compiled Javascript in `bundle.js` along with the styles in `bundle.css`. 

When the app first loads it first checks to see which of the following 3 ways it was accessed. These are determined based upon the URL parameters in the user's browser address bar because Mturk will automatically add in parameters depending on what a Turker is trying to do. The URL parsing is handled in `utils.js` and checked in `App.svelte`: 
1. `non-mturk` - The live app was directly accessed via it's URL on netlify rather than via mturk and so no URL parameters are present. This will prevent any actions and notify the user that they should access the app via Mturk or run it in development mode instead.
2. `mturk-preview` - The URL parameters contain a workerId and hitId but no assignmentId which means a Worker is previewing the HIT. This will only display a single page of the app (`MTurkPreview.svelte`) and ask the user to accept the HIT if they want to proceed
3. An accepted HIT via mturk - The URL parameters will now contain a workerId, hitId, as well as an assignmentId, which indicates a Worker has begun working on your task and has the option to submit or return it.

## Component hierarchy and internal app state

Only situation 3) above will proceed through the rest of the app which is *state* based. You can think of this is a "router" that determines what should be shown to a user based on what *state* the app is in. At any given time a user will be in one of the following states which are always recorded to firebase making states persist across browser closes/refreshes:
- `consent`, `instructions`, `tutorial/quiz`, `experiment`, `debrief`, `completed` or `noConsent` 

`App.svelte` is the parent-most component keeping track of the current state and rendering child components ("pages") accordingly. Child components expect user interaction which will in turn emit an event back to `App.svelte` with information about what state transition should occur. 

For example, after accepting a HIT the user will be in the `consent` state and `App.svelte` will see this and render the `Consent.svelte` component. From within this component a user can choose to consent or not which will emit a `consent` or `reject` event back to `App.svelte`. `App.svelte` will then update the state to `instructions` or `noConsent` and as a result render `Instructions.svelte` or `ReturnHIT.svelte` respectively. 

The only user state that doesn't induced a UI change is going from `tutorial` -> `quiz` because they're part of the same component (`Quiz.svelte`). We simply distinguish these to be able live monitor the app and get separate timings for these two phases of the same application state.

## Data and state management
State management as well as experiment progress is handled by a Svelte store `userStore` defined in `utils.js`. The general pattern employed throughout the app is *subscribing* to the most up-to-date version of the `userStore` in firebase from within `App.svelte`, and then updating the store and writing back to firestore in the various pages and components via the `updateUser` function defined in `utils.js`. This ensure that pages and components are guaranteed to have the "freshest" user data  as long as they read from `$userStore.someField`, regardless of what page or component last updated that data. 

The initial subscription to the user data is setup in `App.svelte` when the app first boots up, additionally ensuring that refreshing (or closing an reopening) the app will always resume from the last state a user was in.

## Styles and Animation

All styles are handled by the [Bulma](https://bulma.io/) CSS framework along with *v3* of [Animate.css](https://animate.style/#migration).