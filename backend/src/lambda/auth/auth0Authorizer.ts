import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')


// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-3xb6q98a.us.auth0.com/.well-known/jwks.json'
const certi = "-----BEGIN CERTIFICATE-----\nMIIDDTCCAfWgAwIBAgIJPLa756sFNrxvMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV\nBAMTGWRldi0zeGI2cTk4YS51cy5hdXRoMC5jb20wHhcNMjIxMDAzMDcyNDAxWhcN\nMzYwNjExMDcyNDAxWjAkMSIwIAYDVQQDExlkZXYtM3hiNnE5OGEudXMuYXV0aDAu\nY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0lbXaIRhzdJocoiT\nudRLGogBxYgeIYx2ASYqDRdL9of8Ds33yJOlx/YoQixVZuYcxQBXcNdnAaU2HThj\nCUCArEjOchziOEYU9d5GhKTjiUjjx3iae4ri9vC9csjF2sQk0qJCkcjoXQjUuWSu\nBLLTx1NjiTZqsn95GoNIHm69WXuP9sNFn29FjXLV16kuY5ajZ9/SCNyFJMVzXM7T\nuMxFiwKRy7f3hDCmLSGtdBFinPuVwtThxqCmzUNF1nq/I19x6pZ9K6Zunav7UWLe\nUulHUkCRPm2g5Atvg4kJFg+szCoiFJB8Fr/4jtGwPUAlz903ciymJ+hs0Tbg/o8p\nDwpWfwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRm1M+RDYnx\nPb5iJB+ONmO4aOx0JzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB\nABbOg7yl4CtI8Cp9ZpRAdoy3ezc6YBvLRyo+e7aJ564qrMB+TvWYRBh2cZmOXtLX\nUTifFEbMbxZHR4nT3ozHUp1/rUZyPKNKkCPfKFn6aVOp+R7nvo709zBzTaAOkWLx\n7jGTfmyEKMgQWPkUScdLUG4oz6zzSanW6eX2PL0o7yl//jEvOq/6EOzHNI/UTmpk\n1ywG5cKIi8l8KB9OoOehLuWWohFDJgUtYQhYj67XW0LVGW98yU8IKzrylAaWv/Ec\nhO/SJvWEbeLYe1xOePxlAVivsIJvHDeecV8fqFSEMZp74JZiZQijCKzE2UWBWlgk\nH5M29CbE3SBoTsFmR5LMD6k=\n-----END CERTIFICATE-----"


export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    console.log('jwtToken:', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User wass not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // const certificate = await getCertificate()
  // const cert = certificate.x5c[0]
  
  const certificate= await getCertificate()
  const cert = "-----BEGIN CERTIFICATE-----"+certificate+"-----END CERTIFICATE-----"
  console.log('certificate value :', cert)

  return verify(token, certi, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
  console.log('Token gotten:', token)
}

async function getCertificate() {
  const getCertFromUrl = await Axios.get(jwksUrl)
  return getCertFromUrl.data.keys[0].x5c[0]
}