import { CrossmintPayButton } from '@crossmint/client-sdk-react-ui';

export default function Mint({ usersWalletAddress }) {
  return (
    <CrossmintPayButton
      getButtonText={(connecting, paymentMethod) =>
        connecting ? 'Connecting' : `Pay with credit card`
      }
      collectionId='8de2d3bf-1de9-4513-9dae-fc67b60e2f7b'
      projectId='48567a6a-14d9-4b81-b395-1adc44206902'
      mintConfig={{ totalPrice: '0', _to: '<_TO>' }}
      environment='staging'
      mintTo={usersWalletAddress}
      successCallbackURL='https://anky.lat/welcome'
      failureCallbackURL='https://anky.lat/failure'
    />
  );
}
