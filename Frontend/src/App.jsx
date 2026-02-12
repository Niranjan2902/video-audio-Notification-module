import { useState } from 'react'
import Header from './components/Header/HEader'
import Footer from './components/Footer/Footer'
import './App.css'
import { Axios as axios} from "axios";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>

     <h1 className='bg-green-600 p-4'>React Router</h1>
     
    </>
  )
}

export default App
