//DAO class for Looking up pending provision request /update provisionrequest status
import {} from 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pgPool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABSE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const REQUEST_PROCESSING_STATUS = {
  INITIATED: 'SANDBOX_INITIATED',
  DELETED: 'SANDBOX_DELETED',
  PROVISIONED: 'SANDBOX_PROVISIONED',
  NEW: 'NEW',
  RENEW: 'RENEW',
  DELETE: 'DELETE',
};

const STATUS = {
  REQUESTED: 'REQUESTED',
  FAILED: 'FAILED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
};

export default class ProvisionRequestMgr {
  async findRequestInProgress() {
    try {
      const client = await pgPool.connect();
      const result = await client.query(
        'select * from provision_req_t where request_processing_status IN ($1,$2)',
        [
          REQUEST_PROCESSING_STATUS.INITIATED,
          REQUEST_PROCESSING_STATUS.PROVISIONED,
        ]
      );
      if (result.rowCount == 0) {
        console.info('No InProgress requests  available for processing');
        return result;
      } else if (result.rowCount > 0) {
        console.info(
          'Number of InProgress Requests available for processing ',
          result.rowCount
        );
        return result;
      }
      client.release();
    } catch (error) {
      console.error(
        'Error occured while fetching any pending  requests for update ',
        error.stack
      );
      return false;
    }
  }

  async findNewProvisionRequests() {
    try {
      const client = await pgPool.connect();
      const result = await client.query(
        'select id,email_address,additional_contacts from provision_req_t where request_processing_status IN ($1)',
        [REQUEST_PROCESSING_STATUS.NEW]
      );
      if (result.rowCount == 0) {
        console.info('No New Provision Request available for processing');
        return result;
      } else if (result.rowCount > 0) {
        console.info(
          'Number of New Provision Requests available for processing ',
          result.rowCount
        );
        return result;
      }
      client.release();
    } catch (error) {
      console.error(
        'Error occured while trying to fetch new provision requests',
        error.stack
      );
      return false;
    }
  }
  async updateProvisionRequestWithDetails(provisionRequestID, sandboxDetails) {
    try {
      let requestProcessingStatus = REQUEST_PROCESSING_STATUS.INITIATED,
        status = STATUS.REQUESTED;
      // Other states = creating,starting

      if (
        sandboxDetails.state === 'new' ||
        sandboxDetails.state == 'starting' ||
        sandboxDetails.state == 'creating'
      ) {
        requestProcessingStatus = REQUEST_PROCESSING_STATUS.INITIATED;
        status = STATUS.REQUESTED;
      } else if (sandboxDetails.state === 'started') {
        requestProcessingStatus = REQUEST_PROCESSING_STATUS.PROVISIONED;
        status = STATUS.ACTIVE;
      } else if (sandboxDetails.state == 'deleted') {
        requestProcessingStatus = REQUEST_PROCESSING_STATUS.DELETED;
        status = STATUS.EXPIRED;
      }

      const client = await pgPool.connect();
      const result = await client
        .query(
          `update provision_req_t set "sandbox_details"=$1,"request_processing_status"=$2,"status"=$3,"sandbox_id"=$4 where id IN($5)`,
          [
            sandboxDetails,
            requestProcessingStatus,
            status,
            sandboxDetails.id,
            provisionRequestID,
          ]
        )
        .then((result) => {
          if (result.rowCount == 0) {
            console.info(
              'No Matching provisioned record  found for ID.Something is Wrong !!!',
              provisionRequestID
            );
          } else if (result.rowCount > 0) {
            console.info(
              'Provisioned Request updated with Sandbox Details for ID ',
              provisionRequestID
            );
            return result;
          }
        });
      client.release();
    } catch (error) {
      console.error(error.stack);
      return false;
    }
  }

  async findDeleteProvisionRequests() {
    try {
      const client = await pgPool.connect();
      const result = await client.query(
        'select id,sandbox_id from provision_req_t where request_processing_status IN ($1) AND status=$2',
        [REQUEST_PROCESSING_STATUS.DELETE, STATUS.ACTIVE]
      );
      if (result.rowCount == 0) {
        console.info('No Delete requests available for processing');
        return result;
      } else if (result.rowCount > 0) {
        console.info(
          'Number of Delete Requests available for processing ',
          result.rowCount
        );
        return result;
      }
      client.release();
    } catch (error) {
      console.error(
        'Error occured while fetching any pending  requests for delete ',
        error.stack
      );
      return false;
    }
  }
}
