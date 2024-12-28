import React from 'react'
import { Link} from 'react-router-dom'

function Card({
    logo,
    label,
    className = "",
    slug="login"
}) {
  return (
    <Link className='bg-[#eef0ef] flex justify-center items-center rounded-lg' to={`${slug}`}>
        <div className=''>
          <div className='p-10'>
          <div className='flex items-center flex-col'>
            <img className={`${className} h-24`} src={logo} alt="" />
            <h2 className=''>{label}</h2>
            </div>
          </div>
        </div>
     </Link>
  )
}

export default Card
