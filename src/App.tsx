import Carousel from "./components/Carousel"
import { FiUser } from 'react-icons/fi';

function App() {

  return (
    <>
      

    <div className="flex justify-between items-center w-full h-dvh px-4 gap-5">
      <div className='bg-gray-700 text-center rounded-4xl  border-white/30  border h-[94%]'>
      <div className="flex flex-col justify-center items-center rounded-full p-4 mx-2 mt-2.5 border border-white/30 hover:bg-white/20 transition-colors duration-200 cursor-pointer"
          onClick={() => window.open('https://github.com/repo-so', '_blank')}>
        <FiUser className="h-[16px] w-[16px] text-white" />
      </div>
      </div>
      <div className="flex justify-center items-center bg-[#272727] w-[96%] h-[94%]  rounded-3xl border-white/30 border">
        <Carousel />
      </div>
    </div>
    </>
  )
}

export default App

//<img src="image.jpg" alt="image" loading="lazy" />