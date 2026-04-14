import Image from 'next/image'
import LogoGym from '../../../public/logo.svg'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        className="h-auto w-8 object-contain"
        alt="Logo"
        width={180}
        height={50}
        src={LogoGym}
      />

      <h2 className="text-2xl font-semibold tracking-tight">Iron Challenge</h2>
    </div>
  )
}
