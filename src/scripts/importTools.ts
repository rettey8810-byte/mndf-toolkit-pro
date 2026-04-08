import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toolsData from '../data/tools.json';

export interface ToolData {
  name: string;
  category: 'IT Equipment' | 'Carpentry Tools';
  quantity: number;
  availableQuantity: number;
  condition: 'Good' | 'Damaged' | 'Under Maintenance';
  location: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function importToolsToFirestore(): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const toolsCollection = collection(db, 'tools');
    
    for (const tool of toolsData.tools) {
      try {
        const toolData: ToolData = {
          name: tool.name,
          category: tool.category as 'IT Equipment' | 'Carpentry Tools',
          quantity: tool.quantity,
          availableQuantity: tool.availableQuantity,
          condition: tool.condition as 'Good' | 'Damaged' | 'Under Maintenance',
          location: tool.location,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await addDoc(toolsCollection, {
          ...toolData,
          createdAt: Timestamp.fromDate(toolData.createdAt!),
          updatedAt: Timestamp.fromDate(toolData.updatedAt!)
        });
        
        count++;
        console.log(`✓ Imported: ${tool.name}`);
      } catch (error: any) {
        const errorMsg = `Failed to import ${tool.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Successfully imported: ${count} tools`);
    console.log(`Errors: ${errors.length}`);
    
    return { success: errors.length === 0, count, errors };
  } catch (error: any) {
    const errorMsg = `Import failed: ${error.message}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    return { success: false, count, errors };
  }
}

// Run import if called directly
if (typeof window !== 'undefined' && (window as any).runImportTools) {
  importToolsToFirestore();
}
