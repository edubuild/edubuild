import React, { useState } from 'react';
import { Box, Typography, Button, Tooltip, CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel, Checkbox } from '@mui/material';
// import ProcessorClassCodeSnippetEditor from '../ClassCodeSnippetEditors/ProcessorClassCodeSnippetEditor';
import VariableTable from './VariableTable';
import QuestionCategorySelector from './QuestionCategorySelector';
import { GenerateVariableRequest, generateVariable } from '../../../utils/api/QuestionGenerationAPI';
import { convertArguments, formatValue } from '../../../utils/format';
import { ContextBlockType } from '../../../reducer/questionGenerationReducer';

interface CodeBlockProps {
  tabValue: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  context: ContextBlockType;
  setTopic: (value: string) => void;
  setSubtopic: (value: string) => void;
  setUserTopic: (value: string) => void;
  setUserSubtopic: (value: string) => void;
  setProcessorCodeSnippet: (value: string) => void;
  setProcessorCodeRequiredLines: (value: string[]) => void;
  handleSaveCodeSnippet: () => void;
  loading: boolean;
  handleQuantifiableChange: (variableName: string, value: string) => void;
  handleSubclassChange: (variableName: string, subclassName: string) => void;
  handleArgumentChange: (variableName: string, argName: string, value: any) => void;
  handleArgumentInit: (argumentsInit: { [key: string]: { [arg: string]: any } }, index?: number) => void;
  index?: number;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  tabValue,
  handleTabChange,
  context,
  setTopic,
  setSubtopic,
  setUserTopic,
  setUserSubtopic,
  setProcessorCodeSnippet,
  setProcessorCodeRequiredLines,
  handleSaveCodeSnippet,
  loading,
  handleQuantifiableChange,
  handleSubclassChange,
  handleArgumentChange,
  handleArgumentInit,
  index,
}) => {
  const [generatedVariables, setGeneratedVariables] = useState<{ context: { [key: string]: any }, context_init: { [key: string]: any } }>({ context: {}, context_init: {} });
  const [generating, setGenerating] = useState<boolean>(false);
  const [useOuterContext, setUseOuterContext] = useState<boolean>(false);

  const handleGenerateVariables = async () => {
    const convertedArguments = convertArguments(context.variableArguments, context.algoVariables, context.selectedSubclasses);
    setGenerating(true);
    try {
      const request: GenerateVariableRequest = {
        topic: context.selectedTopic,
        subtopic: context.selectedSubtopic,
        element_type: context.selectedQuantifiables,
        subclasses: context.selectedSubclasses,
        arguments: convertedArguments,
        question_description: '',
      };
      const data = await generateVariable(request);
      // setGeneratedVariables(data.context);
      setGeneratedVariables({ context: data.context, context_init: data.context_init });
      handleArgumentInit(data.context_init, index);
    } catch (error) {
      console.error('Error generating variables:', error);
    } finally {
      setGenerating(false);
    }
  };

  // const handleVariableChange = (name: string, value: any) => {
  //   setGeneratedVariables(prev => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  return (
    <Box
      sx={{
        marginBottom: 2,
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ marginBottom: 2, color: 'primary' }}>
        Code block
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="algorithm type tabs" sx={{ marginBottom: 4 }}>
        <Tab label="Defined Algorithms" />
        <Tab label="New Algorithm" />
      </Tabs>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <QuestionCategorySelector
          tabValue={tabValue}
          topics={context.topics}
          subtopics={context.subtopics}
          topic={context.selectedTopic}
          subtopic={context.selectedSubtopic}
          userTopic={context.selectedTopic}
          userSubtopic={context.selectedSubtopic}
          setTopic={setTopic}
          setSubtopic={setSubtopic}
          setUserTopic={setUserTopic}
          setUserSubtopic={setUserSubtopic}
        />
      </Box>
      {/* {tabValue === 1 && context.selectedTopic && context.selectedSubtopic && userQueryable && (
        <>
          <ProcessorClassCodeSnippetEditor setProcessorCodeSnippet={setProcessorCodeSnippet} setProcessorCodeRequiredLines={setProcessorCodeRequiredLines} />
          <Button variant="contained" color="primary" onClick={handleSaveCodeSnippet} disabled={loading} sx={{ marginBottom: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Save Algorithm'}
          </Button>
        </>
      )} */}
      {index !== undefined && (
        <FormControlLabel
          control={
            <Checkbox
              checked={useOuterContext}
              onChange={(e) => {
                setUseOuterContext(e.target.checked);
                handleArgumentInit({}, index);
              }}
            />
          }
          label="Use Outer Context Variables"
          sx={{ marginTop: 2 }}
        />
      )}
      {!useOuterContext && context.algoVariables.length > 0 && (
        <>
          <Tooltip title="Variables are placeholders in your question. Use {Input}, {Step}, etc. in your question description to represent these variables." placement="bottom-start">
            <Typography variant="subtitle1">
              Algorithm Variables (Use variable name in question description)
            </Typography>
          </Tooltip>
          <VariableTable
            variables={context.algoVariables}
            quantifiables={context.quantifiables}
            selectedQuantifiables={context.selectedQuantifiables}
            selectedSubclasses={context.selectedSubclasses}
            variableArguments={context.variableArguments}
            handleQuantifiableChange={handleQuantifiableChange}
            handleSubclassChange={handleSubclassChange}
            handleArgumentChange={handleArgumentChange}
          />
          <Button variant="contained" color="primary" onClick={handleGenerateVariables} disabled={generating} sx={{ marginTop: 2 }}>
            {generating ? <CircularProgress size={24} /> : 'Generate Variables'}
          </Button>
          {Object.keys(generatedVariables.context).length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6" gutterBottom>
                Generated Variables
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Variable Name</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(generatedVariables.context).map(([name, value]) => (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{formatValue(value)}</TableCell>
                        {/* <TableCell>
                          <TextField
                            value={value}
                            onChange={(e) => handleVariableChange(name, e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                          />
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CodeBlock;