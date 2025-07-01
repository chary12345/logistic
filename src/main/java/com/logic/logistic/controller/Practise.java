package com.logic.logistic.controller;

import java.util.ArrayList;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.slf4j.LoggerFactory;

import com.logic.logistic.LogisticApplication;

public class Practise {
	
//private static final long serialVersionUID=1L;
	
	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();
//	private static Logger logger = LogManager.getLogger();
//	private static final org.slf4j.Logger logger = LoggerFactory.getLogger(LogisticApplication.class);

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ArrayList<String> al = new ArrayList<>();
		al.add("HI");
		al.add("hello");
		al.add("jiii");
		System.out.println(al);
		logger.debug("print Al"+al);
		logger.info("print al"+al);
		logger.error("error");

	}

}
