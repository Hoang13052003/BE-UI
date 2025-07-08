import React from "react";
import { Card, Timeline } from "antd";
import { ProjectUpdateTimelineDto } from "../../../types/project";

interface Props {
  updates: ProjectUpdateTimelineDto[];
}

const ProjectLaborUpdatesTimeline: React.FC<Props> = ({ updates }) => {
  return (
    <Card title="Project Updates Timeline">
      <Timeline
        items={updates.map(update => ({
          color: update.published ? "green" : "gray",
          children: (
            <>
              <div><b>Date:</b> {update.updateDate}</div>
              <div><b>Updated By:</b> {update.createdBy.fullName}</div>
              <div><b>Summary:</b> {update.summary}</div>
              {update.details && <div><b>Details:</b> {update.details}</div>}
              <div><b>Status:</b> {update.statusAtUpdate}</div>
              {update.overallProcess !== null && <div><b>Overall Progress:</b> {update.overallProcess}%</div>}
              {update.actualProcess !== null && <div><b>Actual Progress:</b> {update.actualProcess}%</div>}
            </>
          )
        }))}
      />
    </Card>
  );
};

export default ProjectLaborUpdatesTimeline; 