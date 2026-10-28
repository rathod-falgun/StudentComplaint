package com.project.ComplaintApp;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ComplaintAppApplication {

	@PostConstruct
	public void initTimezone() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
		System.out.println("⏰ Default JVM timezone set to: Asia/Kolkata (IST)");
	}

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
		loadDotEnv();
		SpringApplication.run(ComplaintAppApplication.class, args);
	}

	private static void loadDotEnv() {
		File[] candidates = new File[] {
			new File(".env"),
			new File("backend/.env"),
			new File("../backend/.env")
		};

		for (File envFile : candidates) {
			if (envFile.exists() && envFile.isFile()) {
				try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) {
							continue;
						}
						int eqIdx = line.indexOf('=');
						if (eqIdx > 0) {
							String key = line.substring(0, eqIdx).trim();
							String value = line.substring(eqIdx + 1).trim();
							if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'")))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("✅ Loaded local environment variables from: " + envFile.getAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("Notice: Could not read .env file: " + e.getMessage());
				}
			}
		}
	}
}
