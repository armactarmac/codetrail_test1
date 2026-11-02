package main

/**
 * Test Case 06: Go Backend Worker
 * Language: Go (.go)
 * Expected Result: Fair / Needs Attention
 * Description: Contains shell command execution, hardcoded token, and unresolved task markers.
 */

import (
	"fmt"
	"os/exec"
)

// SECURITY FLAW: Hardcoded secret access token
const api_token = "secret_ghp_9876543210abcdefghijklmnop"

func processUserBackup(archiveName string) error {
	// TODO: Replace shell execution with native archive/tar library
	fmt.Printf("Starting backup with token: %s\n", api_token)

	// SECURITY FLAW: Shell execution with external parameters
	cmd := exec.Command("sh", "-c", "tar -czf "+archiveName+" /var/data")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}

	fmt.Println(string(output))
	return nil
}

func main() {
	err := processUserBackup("user_export.tar.gz")
	if err != nil {
		fmt.Println("Backup failed:", err)
	}
}
