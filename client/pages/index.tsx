import React, {Component} from "react";
import JoinForm from "./components/form";

export default function Homepage() {
  return (
    <div>
      <h1>Welcome to the 10 Pots queue system</h1>
      <JoinForm/>
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