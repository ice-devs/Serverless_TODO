import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
// import * as AWSXRay from 'aws-xray-sdk'
// const XAWS = AWSXRay.captureAWS(AWS)
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils{
    constructor(
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION),
        private readonly s3 = new XAWS.S3({ signatureVersion : 'v4' })){
        }

    async createAttachmentPresignedUrl(todoId: string) {
        return await this.s3.getSignedUrl('putObject', {
          Bucket : this.bucketName,
          Key : todoId,
          Expires : this.urlExpiration
        })
      }
    }