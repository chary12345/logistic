package com.logic.logistic.dto;

import java.util.List;

public class ReceiveRequest {
    private Long lsId;
    private List<String> lrIds;

    public Long getLsId() {
        return lsId;
    }

    public void setLsId(Long lsId) {
        this.lsId = lsId;
    }

    public List<String> getLrIds() {
        return lrIds;
    }

    public void setLrIds(List<String> lrIds) {
        this.lrIds = lrIds;
    }
}
