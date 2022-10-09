import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { createLogger } from '../utils/logger'

// TODO: Implement the fileStogare logic
const logger = createLogger('AttachmentUtils')

export class AttachmentUtils{
    constructor(
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION),
      private readonly s3 = new XAWS.S3({ signatureVersion : 'v4' })){
    }

    async createAttachmentPresignedUrl(todoId: string) {
      logger.info('Generating signedUrl', { todoId : todoId })
      try {
        const result = await this.s3.getSignedUrl('putObject', {
          Bucket : this.bucketName,
          Key : todoId,
          Expires : this.urlExpiration
        })

        logger.info('Signed url generated successfully')
        return result
      } catch (e) {
        logger.error('An error occurred while trying to get signed url', { error: e.message })
      }
    }
}