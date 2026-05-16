package com.logic.logistic.model;

public enum Plan {
 BASIC,
 BASICPLUS,
 ADVANCE,
 PREMIUM;
	
	public String value() {
		return name();
	}
 public static Plan fromValue(String p) {
	 return valueOf(p);
 }
}
