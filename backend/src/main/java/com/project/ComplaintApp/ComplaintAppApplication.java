package com.project.ComplaintApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ComplaintAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(ComplaintAppApplication.class, args);
	}

}
