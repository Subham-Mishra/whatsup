import { Fragment } from "react";

import { initializeApp as firebaseInitializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { ref, getDatabase } from "firebase/database";

import { useAuthState } from "react-firebase-hooks/auth";
import { useList } from "react-firebase-hooks/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  appId: process.env.REACT_APP_API_ID,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

// Initialize Firebase
const app = firebaseInitializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firebase Realtime Database and get a reference to the service
const db = getDatabase(app);

const App = () => {
  const [user] = useAuthState(auth);
  const [snapshots, loading, error] = useList(ref(db, "list"));

  return (
    <div className="grid place-content-center h-screen">
      {user ? "User is signed in" : "User isn't signed in"}
      <p>
        {error && <strong>Error: {error}</strong>}
        {loading && <span>List: Loading...</span>}
        {!loading && snapshots && (
          <>
            <span>
              List:{" "}
              {snapshots.map((v) => (
                <Fragment key={v.key}>{v.val()}, </Fragment>
              ))}
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default App;
