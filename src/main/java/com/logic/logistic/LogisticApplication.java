package com.logic.logistic;

import org.apache.logging.log4j.LogManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LogisticApplication {

//	private static final long serialVersionUID=1L;
//	private static final Logger logger = LoggerFactory.getLogger(LogisticApplication.class);
	
	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();	
	
	public static void main(String[] args) {
		SpringApplication.run(LogisticApplication.class, args);
		
	}

}
