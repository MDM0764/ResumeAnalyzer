package com.resume.analyzer.utilities;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LlmUtilities {
	
	public static String extractTextContent(String outputStr) {
		String txtPtrn = "textContent=(.*?), metadata";
		Pattern pattern = Pattern.compile(txtPtrn);
		Matcher match = pattern.matcher(outputStr);
		if (match.find()) {
			return match.group(1).trim();
		} else {
			return outputStr;
		}

	}

}
