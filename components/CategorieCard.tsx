import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const CategorieCard = ({ catName, catImg, link }: { catName: string, catImg: string, link:string }) => {

  return (
    <Link href={link}>
      <div className='flex flex-col gap-4 items-center border border-blue-200 p-3 min-w-36 rounded-xl cursor-pointer hover:bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40 group transition-all'>
        <Image src={catImg} alt={catName} width={40} height={40} className='group-hover:scale-125 max-w-32' />
        <h2 className='truncate w-32 text-xs'>{catName}</h2>
      </div>
    </Link>
  )
}

export default CategorieCard
