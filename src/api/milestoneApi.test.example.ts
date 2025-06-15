// Test API call for batch delete milestones
// Example usage:

import { batchDeleteMilestonesApi } from './milestoneApi';

// Test batch delete with multiple IDs
const testBatchDelete = async () => {
  try {
    // This will generate: DELETE /api/milestones/batch-delete?ids=1&ids=2&ids=3
    await batchDeleteMilestonesApi([1, 2, 3]);
    console.log('Batch delete successful');
  } catch (error) {
    console.error('Batch delete failed:', error);
  }
};

// Test with 50 milestones (now safe with single API call)
const testLargeBatchDelete = async () => {
  try {
    const largeIdList = Array.from({ length: 50 }, (_, i) => i + 1);
    await batchDeleteMilestonesApi(largeIdList);
    console.log('Large batch delete successful - single API call!');
  } catch (error) {
    console.error('Large batch delete failed:', error);
  }
};

export { testBatchDelete, testLargeBatchDelete };
