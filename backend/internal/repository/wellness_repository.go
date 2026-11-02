package repository

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListActiveWellnessTips() []models.WellnessTip {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, category, title, summary, read_time, symptoms, why_it_happens, action_steps,
			       psychological_insight, daily_habit, expert_advice, is_active, created_at, updated_at
			FROM wellness_tips
			WHERE is_active = TRUE
			ORDER BY created_at DESC
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListActiveWellnessTips error: %v", err)
			return r.defaultWellnessTips()
		}
		defer rows.Close()

		var list []models.WellnessTip
		for rows.Next() {
			var tip models.WellnessTip
			var stepsJSON []byte
			if err := rows.Scan(
				&tip.ID, &tip.Category, &tip.Title, &tip.Summary, &tip.ReadTime,
				&tip.Symptoms, &tip.WhyItHappens, &stepsJSON, &tip.PsychologicalInsight,
				&tip.DailyHabit, &tip.ExpertAdvice, &tip.IsActive, &tip.CreatedAt, &tip.UpdatedAt,
			); err == nil {
				_ = json.Unmarshal(stepsJSON, &tip.ActionSteps)
				list = append(list, tip)
			}
		}
		if len(list) == 0 {
			return r.defaultWellnessTips()
		}
		return list
	}

	return r.defaultWellnessTips()
}

func (r *Repository) ListAllWellnessTips() []models.WellnessTip {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT id, category, title, summary, read_time, symptoms, why_it_happens, action_steps,
			       psychological_insight, daily_habit, expert_advice, is_active, created_at, updated_at
			FROM wellness_tips
			ORDER BY created_at DESC
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListAllWellnessTips error: %v", err)
			return r.defaultWellnessTips()
		}
		defer rows.Close()

		var list []models.WellnessTip
		for rows.Next() {
			var tip models.WellnessTip
			var stepsJSON []byte
			if err := rows.Scan(
				&tip.ID, &tip.Category, &tip.Title, &tip.Summary, &tip.ReadTime,
				&tip.Symptoms, &tip.WhyItHappens, &stepsJSON, &tip.PsychologicalInsight,
				&tip.DailyHabit, &tip.ExpertAdvice, &tip.IsActive, &tip.CreatedAt, &tip.UpdatedAt,
			); err == nil {
				_ = json.Unmarshal(stepsJSON, &tip.ActionSteps)
				list = append(list, tip)
			}
		}
		if len(list) == 0 {
			return r.defaultWellnessTips()
		}
		return list
	}

	return r.defaultWellnessTips()
}

func (r *Repository) GetWellnessTipByID(id string) (*models.WellnessTip, error) {
	if r.db != nil {
		var tip models.WellnessTip
		var stepsJSON []byte
		err := r.db.QueryRow(`
			SELECT id, category, title, summary, read_time, symptoms, why_it_happens, action_steps,
			       psychological_insight, daily_habit, expert_advice, is_active, created_at, updated_at
			FROM wellness_tips
			WHERE id = $1
		`, id).Scan(
			&tip.ID, &tip.Category, &tip.Title, &tip.Summary, &tip.ReadTime,
			&tip.Symptoms, &tip.WhyItHappens, &stepsJSON, &tip.PsychologicalInsight,
			&tip.DailyHabit, &tip.ExpertAdvice, &tip.IsActive, &tip.CreatedAt, &tip.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("টিপস পাওয়া যায়নি")
		}
		_ = json.Unmarshal(stepsJSON, &tip.ActionSteps)
		return &tip, nil
	}

	for _, tip := range r.defaultWellnessTips() {
		if tip.ID == id {
			return &tip, nil
		}
	}
	return nil, fmt.Errorf("টিপস পাওয়া যায়নি")
}

func (r *Repository) CreateWellnessTip(tip models.WellnessTip) (*models.WellnessTip, error) {
	stepsJSON, _ := json.Marshal(tip.ActionSteps)
	now := time.Now()

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO wellness_tips (
				id, category, title, summary, read_time, symptoms, why_it_happens, action_steps,
				psychological_insight, daily_habit, expert_advice, is_active, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		`,
			tip.ID, tip.Category, tip.Title, tip.Summary, tip.ReadTime, tip.Symptoms,
			tip.WhyItHappens, stepsJSON, tip.PsychologicalInsight, tip.DailyHabit,
			tip.ExpertAdvice, tip.IsActive, now, now,
		)
		if err != nil {
			return nil, fmt.Errorf("ডাটাবেজ সেভ ত্রুটি: %w", err)
		}
	}

	tip.CreatedAt = now
	tip.UpdatedAt = now
	return &tip, nil
}

func (r *Repository) UpdateWellnessTip(id string, req models.UpdateWellnessRequest) (*models.WellnessTip, error) {
	existing, err := r.GetWellnessTipByID(id)
	if err != nil {
		return nil, err
	}

	if req.Category != "" {
		existing.Category = req.Category
	}
	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Summary != "" {
		existing.Summary = req.Summary
	}
	if req.ReadTime != "" {
		existing.ReadTime = req.ReadTime
	}
	if req.Symptoms != "" {
		existing.Symptoms = req.Symptoms
	}
	if req.WhyItHappens != "" {
		existing.WhyItHappens = req.WhyItHappens
	}
	if len(req.ActionSteps) > 0 {
		existing.ActionSteps = req.ActionSteps
	}
	if req.PsychologicalInsight != "" {
		existing.PsychologicalInsight = req.PsychologicalInsight
	}
	if req.DailyHabit != "" {
		existing.DailyHabit = req.DailyHabit
	}
	if req.ExpertAdvice != "" {
		existing.ExpertAdvice = req.ExpertAdvice
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	now := time.Now()
	existing.UpdatedAt = now
	stepsJSON, _ := json.Marshal(existing.ActionSteps)

	if r.db != nil {
		_, err := r.db.Exec(`
			UPDATE wellness_tips SET
				category = $1, title = $2, summary = $3, read_time = $4, symptoms = $5,
				why_it_happens = $6, action_steps = $7, psychological_insight = $8,
				daily_habit = $9, expert_advice = $10, is_active = $11, updated_at = $12
			WHERE id = $13
		`,
			existing.Category, existing.Title, existing.Summary, existing.ReadTime,
			existing.Symptoms, existing.WhyItHappens, stepsJSON, existing.PsychologicalInsight,
			existing.DailyHabit, existing.ExpertAdvice, existing.IsActive, now, id,
		)
		if err != nil {
			return nil, fmt.Errorf("আপডেট ত্রুটি: %w", err)
		}
	}

	return existing, nil
}

func (r *Repository) DeleteWellnessTip(id string) error {
	if r.db != nil {
		_, err := r.db.Exec(`DELETE FROM wellness_tips WHERE id = $1`, id)
		return err
	}
	return nil
}

func (r *Repository) defaultWellnessTips() []models.WellnessTip {
	return []models.WellnessTip{
		{
			ID:       "tip-1",
			Category: "মানসিক স্বাস্থ্য",
			Title:    "উদ্বেগ, অতিরিক্ত চিন্তা (Overthinking) ও প্যানিক দূর করার বিজ্ঞানসম্মত উপায়",
			Summary:  "যখন মন অহেতুক নানা চিন্তায় অস্থির হয়ে ওঠে এবং বুকের ভেতর অজানা চাপ অনুভূত হয়, তখন '৫-৪-৩-২-১' গ্রাউন্ডিং টেকনিক মস্তিষ্ককে তাৎক্ষণিক প্রশান্তি দেয়।",
			ReadTime: "৩ মিনিট পাঠ",
			Symptoms: "মাথায় অবিরাম ভবিষ্যতের ভয়, অতীত ভুলের অনুশোচনা, বুক ধড়ফড় করা এবং কাজে মনোযোগ ধরে রাখতে না পারা।",
			WhyItHappens: "মস্তিষ্কের ইমোশনাল সেন্টার অ্যামিগডালা কাল্পনিক বিপদকে বাস্তব ভেবে অতিরিক্ত স্ট্রেস হরমোন কর্টিসল নিঃসরণ করে।",
			ActionSteps: []string{
				"৫টি জিনিস দেখুন: চোখের সামনে থাকা যেকোনো ৫টি বস্তুর দিকে একদৃষ্টে তাকান।",
				"৪টি জিনিস স্পর্শ করুন: আপনার পোশাক বা টেবিল স্পর্শ করে অনুভূতি টের পান।",
				"৩টি শব্দ শুনুন: দূরবর্তী ফ্যানের বা পাখির আওয়াজ শুনুন।",
				"২টি গন্ধ অনুভব করুন: রুমের সুবাস বা যেকোনো গন্ধ নিন।",
				"১টি গভীর শ্বাস ছাড়ুন: বুক ভরে শ্বাস নিয়ে ধীরে ধীরে ৮ সেকেন্ডে ছাড়ুন।",
			},
			PsychologicalInsight: "মানুষের মন কখনো একই সাথে গভীর ইন্দ্রিয়গ্রাহ্য মনোযোগ এবং কাল্পনিক উদ্বেগ বজায় রাখতে পারে না। এটি মস্তিষ্ককে বর্তমানে ফিরিয়ে আনে।",
			DailyHabit:           "ঘুমানোর আগে ১০ মিনিট ডায়েরির পাতায় সমস্ত দুশ্চিন্তা লিখে ফেলুন (Brain Dump)।",
			ExpertAdvice:         "উদ্বেগ আপনার পরিচয় নয়, এটি সাময়িক অনুভূতি। মনের সাথে যুদ্ধ না করে বন্ধুসুলভ দৃষ্টিতে পর্যবেক্ষণ করুন।",
			IsActive:             true,
		},
		{
			ID:       "tip-2",
			Category: "সম্পর্কের যত্ন",
			Title:    "সম্পর্কে মানসিক দূরত্ব ও ইগো সমাধানের কার্যকরী কৌশল",
			Summary:  "সম্পর্কে জিতে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বড় সাফল্য। ইগো বা না বলা অভিমান জমতে না দিয়ে কীভাবে গভীর যোগাযোগ পুনঃস্থাপন করবেন?",
			ReadTime: "৪ মিনিট পাঠ",
			Symptoms: "কথাবার্তা কমে যাওয়া, প্রতিটি বিষয়ে তর্ক বা খোঁচা দেওয়া, মনের কথা শেয়ার করার ইচ্ছে হারিয়ে ফেলা।",
			WhyItHappens: "দীর্ঘদিন ধরে ছোট ছোট অভিমান প্রকাশ না করে চেপে রাখলে মনের ভেতর অদৃশ্য দেয়াল তৈরি হয়।",
			ActionSteps: []string{
				"I স্টেটমেন্ট ব্যবহার করুন: 'তুমি সবসময় এমন করো' না বলে বলুন—'তোমার এমন আচরণে আমি কষ্ট পেয়েছি'।",
				"ডিজিটাল ডিটক্স টক: প্রতিদিন অন্তত ১৫ মিনিট সব ফোন দূরে রেখে একে অপরের চোখের দিকে তাকিয়ে কথা বলুন।",
				"অতীত ভুলের অস্ত্র না বানানো: বর্তমান সমস্যা নিয়ে কথা বলার সময় পুরোনো ভুল টেনে আনবেন না।",
				"ছোট ছোট ধন্যবাদ ও প্রশংসা: সঙ্গীর ক্ষুদ্রতম ভালো কাজেরও মুখে উচ্চারণ করে প্রশংসা করুন।",
			},
			PsychologicalInsight: "মানুষ সেখানেই নিজেকে সঁপে দেয়, যেখানে সে বিচারহীনভাবে নিরাপদ ও গৃহীত বোধ করে। সম্মান যেখানে থাকে, প্রেম সেখানে অনন্তকাল টিকে থাকে।",
			DailyHabit:           "দিন শেষে সঙ্গীকে একটি সুন্দর বার্তা পাঠান বা বলুন: 'আজকের দিনে তোমার পাশে থাকতে পেরে আমি কৃতজ্ঞ।'",
			ExpertAdvice:         "যেকোনো তর্কের সময় ভাবুন: 'আমি কি তর্কে জিততে চাই, নাকি সম্পর্ককে বাঁচাতে চাই?' ইগো জিতলে সম্পর্ক হেরে যায়।",
			IsActive:             true,
		},
	}
}

