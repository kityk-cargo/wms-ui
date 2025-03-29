/**
 * Pact Contract Files Organizer
 *
 * This script transforms Pact contract files from the default flat structure generated by tests
 * into the required provider-as-folder/consumer-as-file structure.
 *
 * Example transformation:
 * Input:  /pacts/wms_ui-wms_inventory_management.json
 * Output: /pacts/wms_inventory_management/wms_ui.json
 *
 * This organization makes it easier for provider services to verify
 * all contracts that consumers have established with them.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_CONTRACTS_DIRECTORY = path.join(__dirname, "..", "pacts");
const TEMPORARY_WORKING_DIRECTORY = path.join(__dirname, "..", "_temp_pacts");
const PROBLEM_FILES_DIRECTORY = path.join(
  TEMPORARY_WORKING_DIRECTORY,
  "_problematic",
);

/**
 * Creates the contracts directory if it doesn't already exist
 * @returns {boolean} True if directory needed to be created, false if it already existed
 */
function createContractsDirectoryIfMissing() {
  if (!fs.existsSync(SOURCE_CONTRACTS_DIRECTORY)) {
    fs.mkdirSync(SOURCE_CONTRACTS_DIRECTORY, { recursive: true });
    console.log("Created pacts directory for storing contract files");
    return true;
  }
  return false;
}

/**
 * Identifies all contract JSON files in the pacts directory
 * @returns {string[]} Array of contract filenames
 */
function findContractJsonFiles() {
  return fs
    .readdirSync(SOURCE_CONTRACTS_DIRECTORY)
    .filter((file) => file.endsWith(".json"));
}

/**
 * Prepares a clean temporary directory for organizing contract files
 */
function prepareCleanTemporaryDirectory() {
  if (fs.existsSync(TEMPORARY_WORKING_DIRECTORY)) {
    fs.rmSync(TEMPORARY_WORKING_DIRECTORY, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMPORARY_WORKING_DIRECTORY, { recursive: true });
  fs.mkdirSync(PROBLEM_FILES_DIRECTORY, { recursive: true });
}

/**
 * Attempts to extract provider and consumer info from a filename
 * @param {string} filename - The contract filename
 * @returns {Object|null} Object with provider and consumer names, or null if can't determine
 */
function extractParticipantsFromFilename(filename) {
  // Common pattern: consumer-provider.json
  const match = filename.match(/^([^-]+)-([^.]+)\.json$/);
  if (match) {
    return {
      consumer: { name: match[1] },
      provider: { name: match[2] },
    };
  }
  return null;
}

/**
 * Only extracts provider and consumer names from a JSON string
 * IMPORTANT: Never modifies the original content, only reads it for names
 * @param {string} jsonString - The JSON string
 * @returns {Object|null} Object with provider and consumer names, or null if can't determine
 */
function extractNamesFromJson(jsonString) {
  try {
    // Only parse to extract the names, never to modify
    const data = JSON.parse(jsonString);
    const consumerName = data.consumer?.name;
    const providerName = data.provider?.name;

    if (consumerName && providerName) {
      return {
        consumer: { name: consumerName },
        provider: { name: providerName },
      };
    }
  } catch (error) {
    console.log(
      "Unable to parse JSON - that's okay, we'll use filename-based extraction",
      error,
    );
    return null;
  }

  return null;
}

/**
 * Handles a problematic contract file by saving it to a special directory
 * @param {string} contractFilename - The name of the problematic contract file
 * @param {Buffer} originalContent - The untouched binary content of the file
 */
function handleProblematicContractFile(contractFilename, originalContent) {
  console.error(
    `Could not determine provider/consumer for ${contractFilename}`,
  );

  // Save the problematic file for inspection, preserving exact binary content
  const problemFilePath = path.join(PROBLEM_FILES_DIRECTORY, contractFilename);
  fs.writeFileSync(problemFilePath, originalContent);

  console.error(`File saved to _problematic directory for inspection`);
  return false;
}

/**
 * Restructures a single contract file into the provider/consumer folder structure
 * IMPORTANT: This preserves the exact file content - never modifies, only renames/relocates
 * @param {string} contractFilename - The name of the contract file
 * @returns {boolean} - True if successfully organized, false if error occurred
 */
function restructureContractFile(contractFilename) {
  const contractFilePath = path.join(
    SOURCE_CONTRACTS_DIRECTORY,
    contractFilename,
  );

  try {
    // Read the contract file as binary to preserve EXACT contents
    const originalFileBuffer = fs.readFileSync(contractFilePath);

    // For name extraction only, create a string representation
    const contentString = originalFileBuffer.toString("utf8");

    // First try to extract from JSON content (only for name extraction)
    let participantInfo = extractNamesFromJson(contentString);

    // If unsuccessful, try filename-based extraction
    if (!participantInfo) {
      participantInfo = extractParticipantsFromFilename(contractFilename);

      if (participantInfo) {
        console.log(`Using filename for extraction: ${contractFilename}`);
      }
    }

    // If we still couldn't determine the names, handle as problematic
    if (!participantInfo) {
      return handleProblematicContractFile(
        contractFilename,
        originalFileBuffer,
      );
    }

    const consumerName = participantInfo.consumer.name;
    const providerName = participantInfo.provider.name;

    // Create provider directory in the temporary location
    const providerDirectory = path.join(
      TEMPORARY_WORKING_DIRECTORY,
      providerName,
    );
    if (!fs.existsSync(providerDirectory)) {
      fs.mkdirSync(providerDirectory, { recursive: true });
    }

    // Write the EXACT original content to the new location - preserve binary exactness
    const consumerContractFile = path.join(
      providerDirectory,
      `${consumerName}.json`,
    );
    fs.writeFileSync(consumerContractFile, originalFileBuffer);

    console.log(`Restructured contract: ${providerName}/${consumerName}.json`);
    return true;
  } catch (error) {
    console.error(
      `Error processing contract file ${contractFilename}:`,
      error.message,
    );
    return false;
  }
}

/**
 * Preserves non-contract files by copying them to the temporary directory
 */
function preserveNonContractFiles() {
  const nonContractFiles = fs
    .readdirSync(SOURCE_CONTRACTS_DIRECTORY)
    .filter((file) => !file.endsWith(".json") && file !== "_temp");

  for (const nonContractFile of nonContractFiles) {
    const originalFilePath = path.join(
      SOURCE_CONTRACTS_DIRECTORY,
      nonContractFile,
    );
    const preservedFilePath = path.join(
      TEMPORARY_WORKING_DIRECTORY,
      nonContractFile,
    );

    try {
      if (fs.lstatSync(originalFilePath).isDirectory()) {
        // For directories, copy recursively
        fs.cpSync(originalFilePath, preservedFilePath, { recursive: true });
      } else {
        // For regular files, just copy directly
        fs.copyFileSync(originalFilePath, preservedFilePath);
      }
    } catch (error) {
      console.error(
        `Error preserving non-contract file ${nonContractFile}:`,
        error,
      );
    }
  }
}

/**
 * Replaces the original contracts directory with the newly organized structure
 */
function replaceWithReorganizedStructure() {
  // Remove original directory
  fs.rmSync(SOURCE_CONTRACTS_DIRECTORY, { recursive: true, force: true });

  // Create a new empty contracts directory
  fs.mkdirSync(SOURCE_CONTRACTS_DIRECTORY, { recursive: true });

  // Copy all files from temporary directory to the original location
  const allReorganizedFiles = fs.readdirSync(TEMPORARY_WORKING_DIRECTORY);
  for (const reorganizedItem of allReorganizedFiles) {
    // Skip the problematic files directory
    if (reorganizedItem === "_problematic") continue;

    const tempPath = path.join(TEMPORARY_WORKING_DIRECTORY, reorganizedItem);
    const finalPath = path.join(SOURCE_CONTRACTS_DIRECTORY, reorganizedItem);

    if (fs.lstatSync(tempPath).isDirectory()) {
      // For directories, copy recursively
      fs.cpSync(tempPath, finalPath, { recursive: true });
    } else {
      // For files, just copy directly
      fs.copyFileSync(tempPath, finalPath);
    }
  }

  // Clean up temporary working directory when finished
  fs.rmSync(TEMPORARY_WORKING_DIRECTORY, { recursive: true, force: true });
}

/**
 * Orchestrates the entire contract reorganization process
 */
function reorganizeContractFiles() {
  // Create contracts directory if it doesn't exist yet
  if (createContractsDirectoryIfMissing()) {
    process.exit(0); // Exit if directory was just created (no files to process)
  }

  // Find all contract files
  const contractFiles = findContractJsonFiles();
  if (contractFiles.length === 0) {
    console.log("No contract files found to reorganize");
    process.exit(0);
  }

  // Set up temporary working directory
  prepareCleanTemporaryDirectory();

  // Process each contract file
  for (const contractFile of contractFiles) {
    restructureContractFile(contractFile);
  }

  // Preserve any non-contract files
  preserveNonContractFiles();

  // Replace original directory with reorganized structure
  replaceWithReorganizedStructure();

  console.log(
    "Contract files successfully reorganized into provider/consumer structure",
  );
}

// Execute the reorganization process
reorganizeContractFiles();
