package com.example.service;

/**
 * Test Case 07: Java Database Service
 * Language: Java (.java)
 * Expected Result: Needs Attention (Security Flaws + Code Smells)
 * Description: Contains SQL string concatenation vulnerable to injection and empty exception catches.
 */

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class UserDatabaseService {

    public String getUserEmailById(Connection conn, String userInputId) {
        // SECURITY FLAW: Direct string concatenation in SQL query
        String sql = "SELECT email, status FROM users WHERE id = '" + userInputId + "'";
        
        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()) {
                return rs.getString("email");
            }
        } catch (SQLException e) {
            // Empty catch block hides database failures
        }
        
        return null;
    }
}
