import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY not found. Please set it in your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AlgorithmData {
  name: string;
  description: string;
  steps: AlgorithmStep[];
  pseudocode: string;
  timeComplexity: string;
  spaceComplexity: string;
  visualizationData: VisualizationData;
}

export interface AlgorithmStep {
  step: number;
  description: string;
  code: string;
  explanation: string;
}

export interface VisualizationData {
  type: 'array' | 'graph' | 'tree';
  data: number[] | any[];
  currentStep?: number;
}

export async function searchAlgorithm(query: string): Promise<AlgorithmData> {
  if (!API_KEY) {
    throw new Error('API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
  }
  
  let model = null;
  
  // First, let's try to list available models
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log('Available models:', data);
    
    // Find a model that supports generateContent, prefer flash models for better quotas
    const availableModel = data.models?.find((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent') && 
      (model.name.includes('flash') || model.name.includes('lite'))
    ) || data.models?.find((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    if (availableModel) {
      console.log('Using model:', availableModel.name);
      model = genAI.getGenerativeModel({ model: availableModel.name });
    } else {
      throw new Error('No suitable model found');
    }
  } catch (error) {
    console.error('Error listing models:', error);
    // Fallback to trying common model names
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Using fallback model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error);
      }
    }
  }
  
  if (!model) {
    throw new Error('No working model found. Please check your API key and try again.');
  }
  
  const prompt = `
    You are an expert in Data Structures and Algorithms. 
    Based on the user's natural language query: "${query}"
    
    Please provide a comprehensive response in the following JSON format:
    
    {
      "name": "Algorithm Name",
      "description": "Clear description of what the algorithm does",
      "steps": [
        {
          "step": 1,
          "description": "Step description",
          "code": "pseudocode snippet for this step",
          "explanation": "Detailed explanation"
        }
      ],
      "pseudocode": "Complete pseudocode for the algorithm",
      "timeComplexity": "Time complexity analysis (e.g., O(n log n))",
      "spaceComplexity": "Space complexity analysis (e.g., O(1))",
      "visualizationData": {
        "type": "array|graph|tree",
        "data": [sample data for visualization]
      }
    }
    
    IMPORTANT INSTRUCTIONS:
    1. If the query contains a specific array (like "with array [4,2,3,2,1]"), use THAT EXACT array in visualizationData
    2. Break down the algorithm into clear, executable steps showing how it works with the given data
    3. Each step should show the current state of the data after that operation
    4. Provide accurate complexity analysis
    5. Write clear, educational pseudocode
    6. Explain each step in detail with the actual values being processed
    
    For sorting algorithms:
    - Show each comparison and swap step by step
    - Highlight which elements are being compared
    - Show the array state after each iteration
    
    For searching algorithms:
    - Show the search process step by step
    - Highlight the current element being checked
    - Show the search space reduction
    
    Common algorithms to support: 
    - Sorting: bubble, quick, merge, heap, insertion, selection
    - Searching: binary, linear
    - Graph Algorithms: BFS, DFS, Dijkstra, Bellman Ford, Floyd Warshall, Kruskal, Prim
    - Linked List: singly linked list, doubly linked list, circular linked list
    - Dynamic Programming: knapsack, longest common subsequence
    - Greedy algorithms: activity selection, fractional knapsack
    
    For graph algorithms, provide visualization data in adjacency list format:
    {
      "type": "graph",
      "data": {
        "nodeA": [1, 2],
        "nodeB": [0, 3],
        "nodeC": [0, 3],
        "nodeD": [1, 2]
      }
    }
    
    For linked list algorithms, provide visualization data in this format:
    {
      "type": "linkedlist",
      "data": {
        "nodes": [
          {"value": 1, "id": "node1"},
          {"value": 2, "id": "node2"},
          {"value": 3, "id": "node3"}
        ],
        "connections": [
          {"from": "node1", "to": "node2"},
          {"from": "node2", "to": "node3"}
        ],
        "head": "node1",
        "tail": "node3"
      }
    }
    
    For array algorithms, provide array data for step-by-step visualization:
    {
      "type": "array", 
      "data": [4, 2, 3, 2, 1]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const algorithmData = JSON.parse(jsonMatch[0]);
      return algorithmData;
    } else {
      throw new Error('Could not parse algorithm data from response');
    }
  } catch (error) {
    console.error('Error generating algorithm data:', error);
    throw new Error('Failed to generate algorithm data');
  }
}

export async function generateAudioExplanation(algorithmData: AlgorithmData): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    Create a clear, educational audio script for explaining the algorithm "${algorithmData.name}".
    
    The script should:
    1. Be conversational and easy to understand
    2. Explain the algorithm in 2-3 minutes
    3. Cover the main concept, steps, and complexity
    4. Be suitable for text-to-speech conversion
    
    Algorithm details:
    - Description: ${algorithmData.description}
    - Time Complexity: ${algorithmData.timeComplexity}
    - Space Complexity: ${algorithmData.spaceComplexity}
    
    Write the script as if you're teaching a student.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating audio script:', error);
    return 'Unable to generate audio explanation at this time.';
  }
}
