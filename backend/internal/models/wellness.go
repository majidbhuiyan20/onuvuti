package models

import "time"

type WellnessTip struct {
	ID                   string    `json:"id"`
	Category             string    `json:"category"`
	Title                string    `json:"title"`
	Summary              string    `json:"summary"`
	ReadTime             string    `json:"readTime"`
	Symptoms             string    `json:"symptoms"`
	WhyItHappens         string    `json:"whyItHappens"`
	ActionSteps          []string  `json:"actionSteps"`
	PsychologicalInsight string    `json:"psychologicalInsight"`
	DailyHabit           string    `json:"dailyHabit"`
	ExpertAdvice         string    `json:"expertAdvice"`
	IsActive             bool      `json:"isActive"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

type CreateWellnessRequest struct {
	Category             string   `json:"category"`
	Title                string   `json:"title"`
	Summary              string   `json:"summary"`
	ReadTime             string   `json:"readTime"`
	Symptoms             string   `json:"symptoms"`
	WhyItHappens         string   `json:"whyItHappens"`
	ActionSteps          []string `json:"actionSteps"`
	PsychologicalInsight string   `json:"psychologicalInsight"`
	DailyHabit           string   `json:"dailyHabit"`
	ExpertAdvice         string   `json:"expertAdvice"`
	IsActive             *bool    `json:"isActive,omitempty"`
}

type UpdateWellnessRequest struct {
	Category             string   `json:"category"`
	Title                string   `json:"title"`
	Summary              string   `json:"summary"`
	ReadTime             string   `json:"readTime"`
	Symptoms             string   `json:"symptoms"`
	WhyItHappens         string   `json:"whyItHappens"`
	ActionSteps          []string `json:"actionSteps"`
	PsychologicalInsight string   `json:"psychologicalInsight"`
	DailyHabit           string   `json:"dailyHabit"`
	ExpertAdvice         string   `json:"expertAdvice"`
	IsActive             *bool    `json:"isActive,omitempty"`
}
