# Changes Made for TimeLog Excel Upload API Update

## Overview
Updated frontend to match backend API changes where the parameter was changed from `projectId` to `projectLaborId` in the Excel upload endpoint.

## Backend Changes (Referenced)
```java
@PostMapping(value = "/upload-excel", consumes = { "multipart/form-data" })
public ResponseEntity<ExcelUploadResponseDTO> uploadTimeLogsFromExcel(
        @RequestParam("file") MultipartFile file,
        @RequestParam("projectLaborId") String projectLaborId) {
    // Implementation...
}
```

## Frontend Changes Made

### 1. API Layer (`src/api/timelogApi.ts`)
- **Function**: `uploadTimelogsExcelApi`
- **Change**: Updated parameter name from `projectId` to `projectLaborId`
- **FormData**: Changed `formData.append("projectId", ...)` to `formData.append("projectLaborId", ...)`

```typescript
// Before
export const uploadTimelogsExcelApi = async (
  projectId: string,
  file: File
): Promise<ExcelUploadResponseDTO> => {
  // ...
  formData.append("projectId", projectId.toString());
  // ...
}

// After  
export const uploadTimelogsExcelApi = async (
  projectLaborId: string,
  file: File
): Promise<ExcelUploadResponseDTO> => {
  // ...
  formData.append("projectLaborId", projectLaborId.toString());
  // ...
}
```

### 2. Component Layer (`src/components/Admin/FileDropUpload/FileDropUpload.tsx`)
- **Interface**: Updated `FileDropUploadProps` interface
- **Props**: Changed prop name from `projectId` to `projectLaborId`
- **Usage**: Updated API call to use new parameter name

```typescript
// Before
interface FileDropUploadProps {
  projectId: string;
  // ...
}

// After
interface FileDropUploadProps {
  projectLaborId: string;
  // ...
}
```

### 3. Consumer Component (`src/components/Admin/TimelogDetailsDisplay.tsx`)
- **Usage**: Updated `FileDropUpload` component call to use new prop name
- **Comment**: Added clarifying comment about projectId actually being projectLaborId

```tsx
// Before
<FileDropUpload
  projectId={projectId}
  // ...
/>

// After
<FileDropUpload
  projectLaborId={projectId}
  // ...
/>
```

## API Endpoint
- **URL**: `POST /api/timelogs/upload-excel`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: Excel file to upload
  - `projectLaborId`: Project Labor ID (changed from projectId)

## Response Format
The response format remains unchanged:
```typescript
interface ExcelUploadResponseDTO {
  message?: string;
  totalRowsInFile: number;
  successfulImports: number;
  failedImports: number;
  error?: string;
  errorsDetails?: string[];
}
```

## Notes
- All existing functionality remains the same
- Only parameter naming was updated to match backend requirements
- No breaking changes for end users
- Error handling and validation logic unchanged
