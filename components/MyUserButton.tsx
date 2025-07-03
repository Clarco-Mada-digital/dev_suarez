import { UserButton } from '@clerk/nextjs'
import { shadesOfPurple } from '@clerk/themes'
import { SettingsIcon } from 'lucide-react'
import React from 'react'

const MyUserButton = () => {
  return (
    <div>
      <UserButton appearance={{ baseTheme: shadesOfPurple }} >
        <UserButton.UserProfilePage
          label="Site paramètres"
          url="custom"
          labelIcon={<SettingsIcon width={16} height={16} />}
        >
        Mes paramètres
        </UserButton.UserProfilePage>
      </UserButton>
    </div>
  )
}

export default MyUserButton
