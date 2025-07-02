package com.logic.logistic.dto;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_article_detail")
public class ArticleDetailDto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "row_num")
	private Long id; // ✅ Just a technical identifier


	@Column(name = "article")
	private String article;

	@Column(name = "art_qty")
	private String artQty;

	@Column(name = "art_type")
	private String artType;

	@Column(name = "said_to_contain")
	private String saidToContain;

	@Column(name = "art_amt")
	private String artAmt;

	@Column(name = "total")
	private String total;

	@Column(name = "loading_reciept")
	private String loadingReciept;

	@Column(name = "company_code")
	private String companyCode;
	// No @Id required for insert-only logic

	public String getArticle() {
		return article;
	}

	public void setArticle(String article) {
		this.article = article;
	}

	public String getArtQty() {
		return artQty;
	}

	public void setArtQty(String artQty) {
		this.artQty = artQty;
	}

	public String getArtType() {
		return artType;
	}

	public void setArtType(String artType) {
		this.artType = artType;
	}

	public String getSaidToContain() {
		return saidToContain;
	}

	public void setSaidToContain(String saidToContain) {
		this.saidToContain = saidToContain;
	}

	public String getArtAmt() {
		return artAmt;
	}

	public void setArtAmt(String artAmt) {
		this.artAmt = artAmt;
	}

	public String getTotal() {
		return total;
	}

	public void setTotal(String total) {
		this.total = total;
	}

	public String getLoadingReciept() {
		return loadingReciept;
	}

	public void setLoadingReciept(String loadingReciept) {
		this.loadingReciept = loadingReciept;
	}

	

	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	
}

