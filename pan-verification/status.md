# Get Status

> Use this API to get the verification status of the Verify PAN Sync API. You need to enter the reference ID to get the verification status.

## OpenAPI

````yaml get /pan/{reference_id}
paths:
  path: /pan/{reference_id}
  method: get
  servers:
    - url: https://sandbox.cashfree.com/verification
      description: Sandbox Server
    - url: https://api.cashfree.com/verification
      description: Production Server
  request:
    security:
      - title: XClientID & XClientSecret
        parameters:
          query: {}
          header:
            x-client-id:
              type: apiKey
              description: >-
                Your unique client identifier issued by Cashfree. You can find
                this in your [Merchant
                Dashboard](https://merchant.cashfree.com/verificationsuite/developers/api-keys).
            x-client-secret:
              type: apiKey
              description: >-
                The secret key associated with your client ID. Use this to
                authenticate your API requests. You can find this in your
                [Merchant
                Dashboard](https://merchant.cashfree.com/verificationsuite/developers/api-keys).
          cookie: {}
    parameters:
      path:
        reference_id:
          schema:
            - type: string
              required: true
              description: >-
                It is the unique ID created by Cashfree Payments that you
                receive in the response of Verify PAN Sync API.
              default: '123546'
      query: {}
      header:
        x-cf-signature:
          schema:
            - type: string
              required: false
              description: >-
                Send the signature if two-factor authentication is selected as
                Public Key.  [More
                details](https://www.cashfree.com/docs/api-reference/vrs/getting-started#2fa-api-signature-generation)
        x-api-version:
          schema:
            - type: string
              required: false
              description: >-
                It is the API version. To receive the aadhaar seeding status in
                the response, use any date after 2022-09-12
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              pan:
                allOf:
                  - type: string
                    description: >-
                      It displays the unique 10-character alphanumeric
                      identifier issued by the Income Tax Department.
                    example: ABCPV1234D
              type:
                allOf:
                  - type: string
                    description: It displays the type of the PAN issued.
                    example: Individual
              reference_id:
                allOf:
                  - type: integer
                    description: >-
                      It displays the unique ID created by Cashfree Payments for
                      reference purposes.

                      format: `int64`
                    format: int64
                    example: 161
              name_provided:
                allOf:
                  - type: string
                    description: It displays the name entered in the API request.
                    example: JOHN DOE
              registered_name:
                allOf:
                  - type: string
                    description: It displays the PAN registered name.
                    example: JOHN DOE
              valid:
                allOf:
                  - type: boolean
                    description: It displays the status of the PAN card.
                    example: true
              father_name:
                allOf:
                  - type: string
                    description: It displays the father's name of the PAN card holder.
                    example: ''
              message:
                allOf:
                  - type: string
                    description: >-
                      It displays details about the success or failure of the
                      API request.
                    example: PAN verified successfully
              name_match_score:
                allOf:
                  - type: string
                    description: It displays the score for the name match verification.
                    example: '100.00'
              name_match_result:
                allOf:
                  - type: string
                    description: >-
                      It displays the result of the name match verification.
                      Possible values are:

                      - `DIRECT_MATCH`

                      - `GOOD_PARTIAL_MATCH`

                      - `MODERATE_PARTIAL_MATCH`

                      - `POOR_PARTIAL_MATCH`

                      - `NO_MATCH`
                    example: DIRECT_MATCH
              aadhaar_seeding_status:
                allOf:
                  - type: string
                    description: >-
                      It displays additional information of the linking of
                      aadhaar and PAN card. Possible values are:

                      - `Y`: "Aadhaar is linked to pan"

                      - `R`: "Aadhaar is not linked to pan"

                      - `NA`: "Not applicable, in case of business pan"
                    example: 'Y'
              last_updated_at:
                allOf:
                  - type: string
                    description: It displays the last updated date.
                    example: 01/01/2019
              name_pan_card:
                allOf:
                  - type: string
                    description: It displays the name displayed on the PAN card.
                    example: JOHN DOE
              pan_status:
                allOf:
                  - type: string
                    description: >-
                      It displays the status of the PAN card. Possible values
                      are:

                      - `VALID`

                      - `INVALID`

                      - `DELETED`

                      - `DEACTIVATED`
                    example: VALID
              aadhaar_seeding_status_desc:
                allOf:
                  - type: string
                    description: >-
                      It displays additional information of the linking of
                      aadhaar and PAN card.
                    example: Aadhaar is linked to PAN
            refIdentifier: '#/components/schemas/GetVerifyPanResponseSchema'
        examples:
          Valid PAN Individual:
            value:
              pan: ABCPV1234D
              type: Individual
              reference_id: 161
              name_provided: JOHN DOE
              registered_name: JOHN DOE
              valid: true
              message: PAN verified successfully
              name_match_score: 100
              name_match_result: DIRECT_MATCH
              aadhaar_seeding_status: 'Y'
              last_updated_at: 01/01/2019
              name_pan_card: JOHN DOE
              pan_status: VALID
              aadhaar_seeding_status_desc: Aadhaar is linked to PAN
          Valid PAN Business:
            value:
              pan: AAOCS4553K
              type: Company
              reference_id: 1318808
              name_provided: saanchi
              registered_nam: SAANCHI ENERGY PRIVATE LIMITED
              valid: true
              message: PAN verified successfully
              name_match_score: 60
              name_match_result: MODERATE_PARTIAL_MATCH
              aadhaar_seeding_status: NA
              last_updated_at: 25/05/2017
              name_pan_card: null
              pan_status: VALID
              aadhaar_seeding_status_desc: Aadhar Seeding is not Applicable
          Invalid PAN:
            value:
              pan: ABCPV1234D
              reference_id: 17974435
              name_provided: null
              valid: false
              message: Invalid PAN
              name_match_score: 0
              name_match_result: '-'
        description: Success response for verifiying PAN information
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - &ref_0
                    type: string
                    example: x-client-id_missing
              error:
                allOf:
                  - &ref_1
                    type: object
                    example:
                      ref_id: 102
              message:
                allOf:
                  - &ref_2
                    type: string
                    example: x-client-id is missing in the request.
                    description: It displays the outcome of the error.
              type:
                allOf:
                  - &ref_3
                    type: string
                    example: validation_error
                    description: It displays the type of error.
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          Credentials Missing:
            value:
              type: validation_error
              code: x-client-id_missing
              message: x-client-id is missing in the request.
          Test Credentials in Prod:
            value:
              type: validation_error
              code: x-client-secret_value_invalid
              message: Client secret belongs to test environment
        description: Validation error because x-client-id is missing in the request
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - *ref_0
              error:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
              type:
                allOf:
                  - *ref_3
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          Invalid client ID and client secret combination:
            value:
              type: authentication_error
              code: authentication_failed
              message: Invalid clientId and clientSecret combination
        description: Invalid client ID and client secret combination
    '403':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - *ref_0
              error:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
              type:
                allOf:
                  - *ref_3
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          IP not whitelisted:
            value:
              type: authentication_error
              code: ip_validation_failed
              message: >-
                IP not whitelisted your current ip is 106.51.91.104.For IP
                whitelisting assistance, visit our guide at
                https://www.cashfree.com/docs/secure-id/get-started/integration/ip-whitelisting-verification
          x-cf-signature header missing:
            value:
              type: validation_error
              code: authentication_failed
              message: x-cf-signature missing in the request header
        description: Authentication error (IP not whitelisted)
    '404':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - *ref_0
              error:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
              type:
                allOf:
                  - *ref_3
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          example:
            value:
              type: not_found_error
              code: referenceId_not_found
              message: Incorrect referenceId
        description: Not found error
    '429':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - *ref_0
              error:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
              type:
                allOf:
                  - *ref_3
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          Rate limit error per operation:
            value:
              type: rate_limit_error
              code: too_many_requests_per_operation
              message: Too many requests for this operation, rate limit reached
          Rate limit error per IP:
            value:
              type: rate_limit_error
              code: too_many_requests_per_ip
              message: Too many requests from the IP, rate limit reached
        description: Rate limit exceed error.
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - *ref_0
              error:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
              type:
                allOf:
                  - *ref_3
            refIdentifier: '#/components/schemas/ErrorResponseSchema'
        examples:
          Internal Server Error:
            value:
              type: internal_error
              code: request_failed
              message: Unable to process your request. Try again after some time
        description: Internal error
  deprecated: false
  type: path
components:
  schemas: {}

````