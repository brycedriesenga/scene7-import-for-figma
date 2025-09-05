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


// --- TYPE DEFINITIONS ---
interface ImageData {
    imageName: string;
    topLayerUrl: string;
    shadowLayerUrl: string;
}

interface PlacementOptions {
    placementMode: 'new' | 'replace';
    filterByName: boolean;
    nameFilter: string;
}

interface PluginMessage {
    type: string;
    images: ImageData[];
    options: PlacementOptions;
}


// --- FIGMA PLUGIN INITIALIZATION ---
// Runs this code once the plugin is launched
figma.showUI(__html__, { width: 500, height: 850 });


// --- MESSAGE HANDLING ---
// Listens for messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
    if (msg.type === 'PLACE_IMAGES') {
        const { images, options } = msg;

        if (!images || images.length === 0) {
            figma.notify('No images to place.', { error: true });
            return;
        }

        if (options.placementMode === 'new') {
            await placeAsNewLayers(images);
        } else { // 'replace' mode
            await replaceSelectionFills(images, options);
        }
    }
};


// --- HELPER FUNCTIONS ---

/**
 * Generates an array of Paint objects for an image, including a shadow layer if specified.
 * @param imageData - The data for the image.
 * @returns A promise that resolves to an array of Paint objects.
 */
async function createImageFills(imageData: ImageData): Promise<Paint[]> {
    const { imageName, topLayerUrl, shadowLayerUrl } = imageData;
    const fills: Paint[] = [];

    // --- Process Shadow Layer (if provided) ---
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
    const mainBytes = await fetch(topLayerUrl).then(res => res.arrayBuffer());
    const mainImage = figma.createImage(new Uint8Array(mainBytes));
    fills.push({
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: mainImage.hash
    });

    return fills;
}


/**
 * Replaces the fills of selected layers.
 * @param imagesData - Array of images to use for fills.
 * @param options - Placement options.
 */
async function replaceSelectionFills(imagesData: ImageData[], options: PlacementOptions) {
    let targets = figma.currentPage.selection.slice();

    if (targets.length === 0) {
        figma.notify('Select layers to replace their fills.', { error: true });
        return;
    }

    if (options.filterByName && options.nameFilter) {
        targets = targets.filter(node => node.name.includes(options.nameFilter));
        if (targets.length === 0) {
            figma.notify(`No selected layers include "${options.nameFilter}" in their name.`, { error: true });
            return;
        }
    }
    
    if (imagesData.length < targets.length) {
        figma.notify(`Replacing ${targets.length} layers with ${imagesData.length} image(s). Images will be reused.`, { timeout: 3000 });
    }

    const notification = figma.notify(`Updating ${targets.length} layer(s)...`, { timeout: Infinity });

    try {
        const updatePromises = targets.map((node, index) => {
            if (!('fills' in node)) {
                console.warn(`Skipping layer "${node.name}" as it does not support fills.`);
                return Promise.resolve();
            }
            const imageData = imagesData[index % imagesData.length]; // Cycle through images
            return createImageFills(imageData).then(newFills => {
                node.fills = newFills;
            });
        });

        await Promise.all(updatePromises);
        
        notification.cancel();
        figma.notify(`Successfully updated ${targets.length} layer(s).`);

    } catch (error) {
        notification.cancel();
        console.error('Failed to replace fills:', error);
        figma.notify('Error replacing fills. Check console for details.', { error: true });
    }
}


/**
 * Creates new rectangle nodes for each image and places them on the canvas.
 * @param imagesData - Array of images to create.
 */
async function placeAsNewLayers(imagesData: ImageData[]) {
    const notification = figma.notify(`Placing ${imagesData.length} image(s)...`, { timeout: Infinity });

    try {
        const createdNodes: SceneNode[] = await Promise.all(
            imagesData.map(data => createImageNode(data))
        );
        
        const target = figma.currentPage;
        const { x, y } = figma.viewport.center;
        const PADDING = 20;
        const totalWidth = createdNodes.reduce((acc, node) => acc + node.width + PADDING, 0) - PADDING;
        let currentX = x - totalWidth / 2;

        createdNodes.forEach(node => {
            target.appendChild(node);
            node.x = currentX;
            node.y = y - node.height / 2;
            currentX += node.width + PADDING;
        });
        
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


/**
 * Creates a single RectangleNode with two image fills (main and shadow).
 * @param imageData - The data for the image to create.
 * @returns A promise that resolves to the created RectangleNode.
 */
async function createImageNode(imageData: ImageData): Promise<RectangleNode> {
    const { imageName } = imageData;
    const node = figma.createRectangle();
    node.name = imageName;
    
    const fills = await createImageFills(imageData);
    
    // The main image determines the node's dimensions
    const mainImageFill = fills.find(f => f.type === 'IMAGE' && f.blendMode !== 'MULTIPLY');
    if (mainImageFill && mainImageFill.imageHash) {
         const mainImage = figma.getImageByHash(mainImageFill.imageHash);
         if (mainImage) {
            const { width, height } = await mainImage.getSizeAsync();
            node.resize(width, height);
         }
    }
    
    // Apply all collected fills to the single node
    node.fills = fills;

    return node;
}