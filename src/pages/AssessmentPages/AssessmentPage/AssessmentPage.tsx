import { Box, Grid, Button, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../../../components/NavBar/Navbar";
import { getUserAssessments, createAssessment, AssessmentList } from "../../../utils/api/AssessmentAPI";
import { AuthContext } from "../../../context/Authcontext";

const AssessmentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [assessments, setAssessments] = useState<AssessmentList[]>([]);
  const [newAssessment, setNewAssessment] = useState<string>("");
  const [view, setView] = useState<'assessment' | 'questionBank'>('assessment');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (view === 'questionBank') {
      navigate(`/projects/${projectId}/questionBanks`);
    }
  }, [view, navigate, projectId]);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (user) {
        const userAssessments = await getUserAssessments(user.id);
        setAssessments(userAssessments);
      }
    };
    fetchAssessments();
  }, [user]);

  if (!projectId) {
    return <div>Error: Project ID is missing</div>;
  }
  if (!user) {
    return <div>Error: User is missing</div>;
  }

  const addAssessment = async () => {
    if (newAssessment.trim() !== "" && !assessments.some(assessment => assessment.title === newAssessment.trim())) {
      const newAssessmentData = {
        title: newAssessment,
        questions: [],
        user_id: user.id,
      };
      const assessmentId = await createAssessment(newAssessmentData);
      setAssessments([...assessments, {...newAssessmentData, _id: assessmentId}]);
      setNewAssessment("");
      // navigate(`/projects/${projectId}/createAssessment/${assessmentId}`);
    } else {
      alert("Assessment already exists or input is empty.");
    }
  };

  const handleAssessmentClick = (assessment: string) => {
    navigate(`/projects/${projectId}/assessments/${assessment}`);
  };

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'assessment' | 'questionBank') => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <NavBar projectId={projectId} />
      <Box sx={{ marginTop: '64px', padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view selection"
          >
            <ToggleButton value="assessment" aria-label="assessment">
              Assessment
            </ToggleButton>
            <ToggleButton value="questionBank" aria-label="question bank">
              Question Bank
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Grid container spacing={2} sx={{ margin: '0 auto', maxWidth: '1200px' }}>
          {assessments.map((assessment, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => handleAssessmentClick(assessment._id)}
              >
                {assessment.title}
              </Box>
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: '1px dashed #ccc',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '150px',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ width: '80%' }}>
                <TextField
                  value={newAssessment}
                  onChange={(e) => setNewAssessment(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ marginBottom: 2 }}
                />
                <Button onClick={addAssessment} variant="outlined" fullWidth>
                  Create new assessment
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AssessmentPage;