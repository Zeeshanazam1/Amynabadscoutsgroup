# Auth Refactoring TODO

## ✅ Step 1: Rewrite `Auth.jsx`
- Create clean, simple Auth component from scratch
- Same green gradient theme, scout badge, Baden-Powell quote
- Google Sign-In (signInWithRedirect)
- Email/Password Login form
- Email/Password Sign Up form (with name field)
- Clean session management via profileManager/sessionStorage
- Proper error messages
- Redirect to home after success

## ⬜ Step 2: Simplify `App.jsx`
- Remove the complex `onAuthStateChanged` redirect logic
- Auth.jsx handles its own redirects internally

## ⬜ Step 3: Delete `Login.jsx`
- Dead code - unused component
