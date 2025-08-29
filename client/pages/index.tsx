import React, {Component} from "react";
import JoinForm from "../components/form";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { WrappedNextRouterError } from "next/dist/server/route-modules/app-route/module";

export default function Homepage() {
  const router = useRouter();
  const { store } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) {
      setLoading(false)
    }
  }, [router.isReady])


  return (
    store ? (
      <div>
        <h1>Welcome to the 10 Pots queue system</h1>
        <p className="text-sm mb-6">Store: {store}</p>
        <div className="m-auto">
          <JoinForm store={store as string} />
        </div>
      </div>
    ) : (
      <div>
        <h1>Error: Store not found. Please try scanning the QR code again.</h1>
      </div>
    )
  );
}


// export default function Index() {

//   const [message, setMessage] = useState("loading");

//   useEffect(() => {
//     fetch("http://localhost:8080/api/home").then(
//       response => response.json()
//     ).then(
//       data => {
//         console.log(data)
//         setMessage(data.message);
//       }
//     )
//   }, [])

//   return <div>{message}</div>;
// }