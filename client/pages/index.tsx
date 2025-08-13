import React, {Component} from "react";
import JoinForm from "../components/form";
import { useRouter } from "next/router";

export default function Homepage() {
  const router = useRouter();
  const {store} = router.query;
  return (
    <div>
      <h1>Welcome to the 10 Pots queue system</h1>
      <p>Store: {store}</p>
      <div className="m-auto">
        <JoinForm store={store as string}/>
      </div>
    </div>
  )
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