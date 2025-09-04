// Fix: Declare Figma plugin API globals and types to resolve TypeScript errors.
// This is a workaround for environments where the @figma/plugin-typings package
// is not available or properly configured.
declare const figma: any;
declare const __html__: string;
type SceneNode = any;
type RectangleNode = any;
type Paint = any;
type FrameNode = any;
type GroupNode = any;
type ComponentNode = any;
type InstanceNode = any;
type PageNode = any;

// This file holds the main code for the plugin. It has access to the Figma API.

// Define the structure of the image data sent from the UI
interface ImageData {
    imageName: string;
    topLayerUrl: string;
    shadowLayerUrl: string;
}

// --- FIGMA PLUGIN INITIALIZATION ---
// Runs this code once the plugin is launched
figma.showUI(__html__, { width: 500, height: 750 });


// --- MESSAGE HANDLING ---
// Listens for messages from the UI
figma.ui.onmessage = async (msg: { type: string, images: ImageData[] }) => {
    if (msg.type === 'CREATE_MULTIPLE_IMAGES') {
        const imagesData = msg.images;
        if (!imagesData || imagesData.length === 0) {
            figma.notify('No images to place.', { error: true });
            return;
        }

        const notification = figma.notify(`Placing ${imagesData.length} image(s)...`, { timeout: Infinity });

        try {
            // Create all image nodes first
            const createdNodes: SceneNode[] = await Promise.all(
                imagesData.map(data => createImageNode(data))
            );

            // Determine where to place the new nodes
            const target = getPlacementTarget();
            const { x, y } = getStartingPosition(target);
            const PADDING = 20;
            let currentX = x;

            // Add nodes to the scene and position them
            createdNodes.forEach(node => {
                target.appendChild(node);
                node.x = currentX;
                node.y = y;
                currentX += node.width + PADDING;
            });
            
            // Select the new nodes and zoom into view
            figma.currentPage.selection = createdNodes;
            figma.viewport.scrollAndZoomIntoView(createdNodes);

            notification.cancel();
            figma.notify(`Successfully placed ${createdNodes.length} image(s).`);

        } catch (error) {
            notification.cancel();
            console.error('Failed to place images:', error);
            figma.notify('Error placing images. Check console for details.', { error: true });
        }
    }
};

// --- HELPER FUNCTIONS ---

/**
 * Creates a single RectangleNode with two image fills (main and shadow).
 * @param imageData - The data for the image to create.
 * @returns A promise that resolves to the created RectangleNode.
 */
async function createImageNode(imageData: ImageData): Promise<RectangleNode> {
    const { imageName, topLayerUrl, shadowLayerUrl } = imageData;
    const node = figma.createRectangle();
    node.name = imageName;
    
    const fills: Paint[] = [];

    // --- Process Shadow Layer (if provided) ---
    // This fill is added first, making it the bottom layer.
    if (shadowLayerUrl) {
        try {
            const shadowBytes = await fetch(shadowLayerUrl).then(res => res.arrayBuffer());
            const shadowImage = figma.createImage(new Uint8Array(shadowBytes));
            fills.push({
                type: 'IMAGE',
                scaleMode: 'FILL',
                imageHash: shadowImage.hash,
                blendMode: 'MULTIPLY'
            });
        } catch (e) {
            console.warn(`Could not create shadow fill for ${imageName}:`, e);
        }
    }

    // --- Process Main Image Layer ---
    // This fill is added second, making it the top layer.
    const mainBytes = await fetch(topLayerUrl).then(res => res.arrayBuffer());
    const mainImage = figma.createImage(new Uint8Array(mainBytes));
    fills.push({
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: mainImage.hash
    });
    
    // The main image determines the node's dimensions
    const { width, height } = await mainImage.getSizeAsync();
    node.resize(width, height);
    
    // Apply all collected fills to the single node
    node.fills = fills;

    return node;
}


/**
 * Determines the target container for placing new nodes.
 * @returns The selected container or the current page.
 */
function getPlacementTarget(): FrameNode | GroupNode | ComponentNode | InstanceNode | PageNode {
    const selection = figma.currentPage.selection;
    if (selection.length === 1 && 'appendChild' in selection[0]) {
        const target = selection[0];
        if (target.type === 'FRAME' || target.type === 'GROUP' || target.type === 'COMPONENT' || target.type === 'INSTANCE') {
             return target;
        }
    }
    return figma.currentPage;
}

/**
 * Calculates the starting X and Y coordinates for placement.
 * @param target - The container where nodes will be placed.
 * @returns The starting coordinates {x, y}.
 */
function getStartingPosition(target: SceneNode): { x: number, y: number } {
    if (target.type === 'PAGE') {
        return figma.viewport.center;
    }
    // For frames/groups, start at the top-left corner
    return { x: 0, y: 0 };
}
